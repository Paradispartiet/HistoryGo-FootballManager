# Fotballboka – originalmateriale og dekningskontroll v1

## Kilder og avgrensning

Dette er en første redaksjonell gjennomgang av tre brukerleverte filer. Den tidligere kanoniske importen fra Fotballboka.pages og dens 16 prinsipper beholdes uendret; PDF-en er ikke dokumentert identisk med Pages-manuset.

| Fil | SHA-256 | Status |
|---|---|---|
| Fotballdokumentet v1.pdf | 085d99d2d14b859c2a6c44a7a8778612e2dcd0338abca6ff605d0f3b74b0f50a | Full tekstuttrekk, 24 843 ord |
| Fotballteori (Den 12.06.2026).one | bc67422f0d8b97ed53d02e2f8316a0901a2dce0888d55908ab574849a5cff6a2 | Delvis binær tekstuttrekk; ikke full sideeksport |
| Fotballnotater (Den 16.05.2026).one | 8a1469c96f3b6e1c3d4f1387eb0d4143b0ece7c1c16c5bc907db63ebd184012c | Delvis binær tekstuttrekk; ikke full sideeksport |

Originaler og råtekst er bevart i separat nedlastingsarkiv, ikke lastet opp til GitHub. Rånotater kan inneholde personopplysninger, uferdige formuleringer og materiale fra tredjeparter. Ingen automatisk publisering av råtekst. I Fotballteori ble 339 lesbare, dedupliserte råblokker på minst 25 ord funnet; 121 finnes som eksakt normalisert tekstsekvens i PDF-en. Dette er ikke en prosentvis dekning av hele OneNote-boken, og øvrige blokker er ikke nødvendigvis unike.

## Første integrasjon: behold alle 49 kapitler og eksisterende illustrasjoner

| Kapittel-ID | Kildeanker | Redaksjonelt tillegg |
|---|---|---|
| press_cover_shift | PDF 2. Defensivt / Forsvarstriangel / Forsink / Identifiser svakhet; Fotballnotater råtekst ved byte 0x000d2624 | Forsvarstriangel, No Splits, sikringsavstand, styring med/uten balanse |
| rest_defence | PDF 2. Defensivt / Risiko / Balanse | 5–7 sek som trenerheuristikk, numerisk og posisjonell balanse |
| overloads_space | PDF Etablert angrep / Støvsuging | Ballføring som trekker press, spillvending |
| out_of_possession | PDF Passivt press (hvilepress) / Presstidspunkt / Falskt press / Pressbølger | Pressrytme, signaler, eksempelavstand, kapasitet |
| in_possession | PDF Spillmodell / Signalpasning | Avtalt bakoverpasning og møtende spiss |
| keepers | PDF Keeper 1.1–1.4 | Vinkel, dybde, returer, distribusjonsvalg og kommunikasjon |
| training_problem | PDF 6. Kapmpanalyse (original stavemåte) | Ni analyseprinsipper og motstanderobservasjon |

De nye avsnittene er redaksjonelle sammenfatninger av originalmaterialet, ikke ordrette sitater eller nye motorregler. Ingen endringer i rolle-ID-er, figurer, øvelsesantall eller kunnskapsprinsipper.

## Videre kontroll (ikke ferdig)

- Individuell forsvarsteknikk: første detaljerte integrasjon gjennomført i `press_cover_shift` (se bolk 2). Full OneNote-kontroll gjenstår.
- Individuelle angrepsferdigheter: første detaljerte integrasjon gjennomført i `in_possession` (se bolk 3); full OneNote-kontroll gjenstår.
- Keeperens detaljerte teknikk og dødballorganisering: første PDF-integrasjon gjennomført (bolk 5). Full OneNote-kontroll gjenstår.
- Spillmodell: første detaljerte PDF-integrasjon gjennomført i bolk 6; separat Ready-materiale, dødballer, OneNote-dekning og motorvalidering gjenstår.
- Droppunkt: Fotballnotater råtekst ved byte 0x000f2da4; kontekst og koordinatsystem må avklares før bruk.
- Kommunikasjon og kampanalyse/-strategi: første detaljerte PDF-integrasjon i bolk 7–8; separat arbeidsoppgavedokument, uutfylt kampforberedelse og OneNote-dekning gjenstår.
- Pedagogikk, øvelsesidéer, kritikk av tidlig spesialisering og sosial tilgang: første PDF-integrasjon i bolk 9; Frade, Seirul·lo, Godfoten, Dreier og Descamps krever ytterligere kilder. Sportsvitenskap: første PDF-integrasjon i bolk 10. Fysiologidisposisjonen er bevart, men den detaljerte fysiologiblokken gjenstår. Psykologi og mental trening er delvis integrert i bolk 11; full mental hovedblokk gjenstår.
- Fotballhistorie, kultur og filosofi: første integrasjon i bolk 14–15; øvrige spiller-/trenercaser og uverifiserte sitater gjenstår.
- Full eksport av begge OneNote-seksjonene med sider, bilder og gjeldende revisjoner; deretter linje-/avsnittsbasert dekningsregister. Ikke anta at binæruttrekk er komplette.

Eksisterende spillmotor er fortsatt source of truth. Koble ny kunnskap til eksisterende mekanismer før eventuelle endringer vurderes. Ingen flere kapitler før dekningskontroll er gjennomført.

## Bolk 2 – individuell forsvarsteknikk

Åtte kildeforankrede underavsnitt i eksisterende teori-kapittel press_cover_shift, basert på PDF 2. Defensivt (linje 1207–1399 og 1660–1780). Eksisterende figurer, kapitler og øvelser beholdt. Underavsnittene vises med egne overskrifter og er inkludert i kapittelsøk.

| ID | Kildeanker |
|---|---|
| first_defender | 2. Defensivt / Førsteforsvarer / Kroppsstilling / Markering og avstand |
| steering | 2. Defensivt / Førsteforsvarer / Lede og styre |
| marking | 2. Defensivt / Soneforsvar / Markering og avstand / Forsvarstriangel |
| blocking | 2. Defensivt / Blokkering av skudd / Forsvare innlegg fra korridor |
| cover | 2. Defensivt / Andreforsvarer/Sikringsspiller / Tredjeforsvarere / Orientering |
| duels | 2. Defensivt / Konkrete forsvarssituasjoner / Forsvare undertall |
| back_to_goal | 2. Defensivt / Forsvare feilvendt / Forsvare overlapping |
| interception | 2. Defensivt / Gå når ballen går / Snappe ballen / Fronting / Forsvarsfinte |

Manusets konkrete avstander er trenerheuristikker, ikke motorparametre. Notater om tilsiktede frispark, ulovlig kontakt og usikre historiske påstander er bevart i originalarkivet, men ikke omsatt til anbefalte spillhandlinger. Ingen nye mekanikker. Posisjonelle arbeidsoppgaver, detaljert pressmodell og offensiv teknikk gjenstår separat. Full CI må bestås.

## Bolk 3 – individuelle angrepsferdigheter

Tolv søkbare underavsnitt i in_possession, basert på PDF linje 1870–2540 (3.1 / 3.1.2). Gjentatte passasjer om pasning, skudd, heading og avslutning er samordnet med den mest detaljerte versjonen som grunnlag. Originalteksten er bevart i separat arkiv. Ingen nye hovedkapitler, figurer, øvelser eller spillmotorregler. Trenerpreferanser er markert som slike; motstridende Shearer-statistikk og uverifiserte kildeattribusjoner er ikke publisert som fakta. Relasjonelle angrepsferdigheter fra 3.2, inkludert persepsjon, orientering og bevegelse, behandles separat.

| ID | Kildeanker |
|---|---|
| attack_principles | 3. Offensivt / Spilleprinsippmodellen |
| carrying | 3.1 Individuelle angrepsferdigheter / Føring |
| dribbling | 3.1 Individuelle angrepsferdigheter / Driblinger |
| cuts | 3.1.2 Retningsforandring / Cuts |
| receiving | 3.1 Individuelle angrepsferdigheter / Mottak, medtak, vending |
| turning | 3.1 Individuelle angrepsferdigheter / Vending |
| passing | 3.1.2 Pasning / Orientering / Pasningens geometri / Skjul pasning |
| passing_types | 3.1.2 Pasning / Innsidepasning / Utsidepasning / Halvt liggende vristpasning / Tåpasning |
| shooting | 3.1.2 Skudd |
| heading | 3.1.2 Heading |
| finishing | 3.1.2 Angrepsavslutning / Bevegelse og timing / Orientering |
| one_on_one | 3.1.2 Angrepsavslutning / Alene med keeper / Straffe |

Datakontroll: 12 stabile, unike ID-er med tittel, fagtekst og kilde; eksisterende fire kampfaser og figurer beholdt. Full CI gjenstår.

## Bolk 4 – relasjonelle angrepsferdigheter

13 søkbare underavsnitt i fire eksisterende kapitler, basert på PDF linje 2530–3144 (3.2 frem til Ballbesittelse / Konservering). Fordelt etter faglig tilhørighet for å unngå duplisering: persepsjon, åpen kropp, seks observasjonsspørsmål, timing, gjennombrudd og innlegg i in_possession; støtte, pasningsskygge, løpsmønstre og oppspill i third_man; rom og 2v1 i overloads_space; medløpspasning og indreløperrelasjoner i overlap_underlap. Manusets absolutte trenerformuleringer om pasningskraft og innlegg er bevart som trenerperspektiv, ikke universelle motorregler; uverifiserte attribusjoner er ikke publisert. Ballbesittelse, etablert angrep og overgang fra neste manusavsnitt behandles sammen med spillmodellen. Ingen nye hovedkapitler, figurer eller motorregler.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| in_possession | perception | Persepsjon / Orientering / Trenerøvelse |
| in_possession | open_body | Persepsjon / Åpen kropp |
| in_possession | reading_game | Observer – still deg spørsmål / Se fram i tid / Kjenn din medspiller |
| in_possession | passing_timing | Pasningsvalg / Timing og tempo / Spill på fot / i rom / Annet |
| in_possession | penetration | Gjennombrudd |
| in_possession | crossing | Innlegg |
| third_man | support_angles | Støtte / Vinklede og diagonale pasninger / Bevegelser uten ball |
| third_man | passing_shadow | Bevegelser uten ball / Pasningsskygge / Mellom porten / Loven om motsatte bevegelser |
| third_man | run_patterns | Rom / Bevegelser uten ball / Samarbeid om romskaping |
| third_man | build_up_patterns | Oppspill / Spill av press |
| overloads_space | space_timing | Rom / Vending av spillet / Rom på kant etter gjenvinning |
| overloads_space | two_against_one | To-mot-en-situasjoner / Kamuflasje |
| overlap_underlap | support_runs | Bevegelser uten ball / Medløpspasning / Indreløperløp / Øyekontakt |

Datakontroll: 13 nye unike ID-er, kildeankre og eksisterende kapittel- og figurantall beholdt. CI gjenstår.

## Bolk 5 – posisjonelle arbeidsoppgaver

18 søkbare fagavsnitt i alle ni eksisterende rollekapitler, basert på PDF linje 811–1206, 1795–1853, 3550–3637 og 3800–3920, med supplerende relevante passasjer fra spillmodell og oppspill. PDF-en henviser også til et separat arbeidsoppgavedokument som ikke er identifisert her. Rolle-ID-er, rolledefinisjoner, 11 rollefigurer og hovedkapittelantall er uendret. Instruksene gjelder manusets konkrete spillmodell, ikke alle varianter av hver spillrolle. Hengende spiss er ikke automatisk en klassisk tier; vingens ulike møteavtaler er synliggjort. Uferdige hypoteser, usikre statistiske/historiske påstander og råformuleringer om uforsvarlig kontakt er ikke presentert som instruks. Full OneNote-kontroll gjenstår.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| keepers | keeper_positioning | 1.1 Posisjonering / Vinkelkontroll / Dybdejustering / Én-mot-én |
| keepers | keeper_saves | 1.2 Skuddstopping / Returer / Spesielle situasjoner / Straffer |
| keepers | keeper_distribution | 1.3 Distribuering / 1.4 Kommunikasjon / 1.5 Dødball / 5.5 4-3-3 |
| centre_backs | centre_back_defence | Posisjonelle oppgaver/valg i forsvar – Stopper / 5.5 4-3-3 |
| centre_backs | centre_back_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Stopper |
| fullbacks | fullback_defence | Posisjonelle oppgaver/valg i forsvar – Back |
| fullbacks | fullback_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Back / 5.5 4-3-3 |
| fullbacks | wingback_corridor | 5.7 3-4-2-1 / Spill med tre bak |
| six_regista | central_midfield_defence | Posisjonelle oppgaver/valg i forsvar – Midtbane / 5.5 4-3-3 |
| six_regista | central_midfield_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Midtbane / Oppspill |
| eight_press | eight_defence | Posisjonelle oppgaver/valg i forsvar – Indreløper / Spillmodell – Back blir utfordret |
| eight_press | eight_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Indreløper / Bevegelser uten ball |
| ten_creator | supporting_forward | 3.3 Posisjonelle oppgaver og valg i angrep – Hengende spiss / 5.5 4-3-3 |
| wingers | winger_defence | Posisjonelle oppgaver/valg i forsvar – Ving / Spillmodell – Back blir utfordret |
| wingers | winger_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Ving / 5.5 4-3-3 |
| link_strikers | meeting_forward | Oppspill / Spillmodell – Klarering / Spill opp – på! / Åpen kropp |
| finishing_press | striker_defence | 3.3 Posisjonelle oppgaver og valg i angrep – Midtspiss |
| finishing_press | striker_attack | 3.3 Posisjonelle oppgaver og valg i angrep – Midtspiss / 5.5 4-3-3 |

## Bolk 6 – spillmønstre og spillmodell

19 nye søkbare fagavsnitt i seks eksisterende kapitler, basert på originalmanusets forsvars-, angreps-, overgangs- og formasjonsbeskrivelser. Manusets egne terminologier, avstander, tidsmål og varianter er beholdt som treneravtaler eller eksempler, inkludert spørsmålstegn, uavklarte målereferanser og alternative valg. Ikke gjort til motorparametre. Historiske spillereksempler og attribusjoner uten særskilt verifisering er ikke presentert som dokumentert historikk. Ready-referansene 2.7.1.2 og 2.8.1.1 er ikke tilgjengelige som selvstendige kilder. Dødballavsnittene og kampstrategi behandles separat. Ingen nye hovedkapitler, figurer eller spillmotorregler.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| in_possession | possession_cycle | Ballbesittelse / Konservering, linje 3138–3198 |
| in_possession | established_model | Etablert angrep / Spillmønstre, linje 3200–3259 |
| in_possession | corridor_to_centre | 4 Spillmønstre/Spillmodell – Etablert angrep fra korridor, linje 3747–3757 |
| in_possession | centre_to_corridor | 4 Spillmønstre/Spillmodell – fra sentralt, linje 3758–3771 |
| in_possession | signal_triangle | 4 Spillmønstre/Spillmodell – Signalpasning / Spill opp – på! / Trekant, linje 3772–3800 |
| out_of_possession | press_height | 2. Defensivt – Pressbølger / Presshøyde, linje 1510–1545 |
| out_of_possession | lock_press | 2. Defensivt – Aktivt press / Lås av; 4 Spillmodell – Lås av med høyt press, linje 1430–1465, 1590–1601 og 3735–3743 |
| out_of_possession | press_triggers | 2. Defensivt – Passivt press / Presstidspunkt / Falskt press, linje 1470–1520 |
| out_of_possession | pump_and_drop | 2. Defensivt – Pressrelaterte momenter / Fall av / Komprimering, linje 1545–1593 |
| out_of_possession | marking_models | 2. Defensivt – Ulike typer markering i press, linje 1600–1619 |
| transition_attack | counter_signal | Overgang / Kontring, linje 3260–3315 |
| transition_attack | counter_3v3 | Kontringsmønstre – 3-mot-3 kontring, linje 3495–3510 |
| transition_attack | counter_4v2 | Kontringsmønstre – 4-mot-2 kontring, linje 3513–3528 |
| transition_attack | counter_width_clearance | Kontringsmønstre – Bruk av bredde i overgang / Spillmodell – Klarering, linje 3530–3548 og 3775–3792 |
| transition_attack | first_after_win | 2. Defensivt – Omstilling / Ballvinning, linje 1635–1654 |
| transition_defend | recalibrate | 2. Defensivt – Omstilling / Gjenvinning / 5-sekundersregelen, linje 1207–1227 og 1620–1658 |
| formations | proactive_reactive | 4 Spillmønstre/Spillmodell – Postulater / Reaktiv og proaktiv strategi, linje 3726–3736 |
| formations | formation_choices | 5.5 4-3-3 / 5.6 4-4-2 / 5.7 3-4-2-1, linje 3800–3918 |
| rest_defence | risk_balance | 2. Defensivt – Risiko / Balanse / Offensiv markering, linje 1409–1434 og 1451–1456 |

## Bolk 7 – kommunikasjon

Seks kildeforankrede, søkbare fagavsnitt i coaching_transfer og collective_training, basert på PDF Kommunikasjon / 4.1 / 4.2 (linje 3654–3726), keeperkommunikasjon, orientering og kampanalyse. Originalmanusets offensive og defensive beskjeder er bevart med normalisert tegnsetting, og kontekstuelle råd om kampklima, én-til-én-tilbakemeldinger, positiv kommunikasjon og relasjoner er integrert. Avsnittene supplerer det eksisterende kunnskapsprinsippet short_commands_create_team_speed uten å endre dets ID, motor, treningsøvelser eller statistikk. Ingen nye hovedkapitler eller figurer. Kontroller er lagt til for avsnitts-ID-er, kilder og sentrale kommandoer. Full CI og OneNote-gjennomgang gjenstår.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| coaching_transfer | communication_purpose | Kommunikasjon, linje 3654–3696 |
| coaching_transfer | communication_timing | Kommunikasjon – kommunikativ timing / kampforløp, linje 3661–3682 |
| coaching_transfer | feedback_culture | Kommunikasjon – personlige tilbakemeldinger / kroppsspråk, linje 3670–3696 |
| collective_training | defensive_language | 4.1 Defensive beskjeder, linje 3697–3715 |
| collective_training | offensive_language | 4.2 Offensive beskjeder / Kampanalyse – Kommunikasjon, linje 3716–3726 og 3928–3936 |
| collective_training | communication_relations | Kommunikasjon / 1.4 Keeperkommunikasjon / Orientering–registrering / Øyekontakt, linje 1188–1200, 1375–1393, 2650–2668 og 3690–3696 |

## Bolk 8 – kampstrategi og kampanalyse

15 søkbare fagavsnitt i training_problem og coaching_transfer fra PDF 6. Kapmpanalyse og 5.3 Strategi (linje 3917–4027), med uttrykkelig forankring i tidligere forsvars- og angrepskapitler for de kortfattede punktene. Den nummererte listen har ni prinsipper selv om overskriften sier seks; alle ni er bevart i rekkefølge. Oppfølgingsspørsmål i punkt 2, 4, 6–9 er redaksjonelle konkretiseringer av originalens prinsipper, ikke nye måledata. Manusets åpne strategispørsmål om hvile med ball og antall spillere bak ballen er ikke gjort om til fasit. Uverifisert 71-prosentpåstand og trenerattribusjoner brukes ikke som dokumentert statistikk eller historiske fakta. 5.1 Kampforberedelse er uutfylt; 5.2 henviser til et separat dokument som ikke er funnet. Ingen nye hovedkapitler, illustrasjoner, spillmotorregler eller statistikkfelt. Full CI og OneNote-gjennomgang gjenstår.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| training_problem | analysis_before_after | 6. Kapmpanalyse / 5.1 Kampforberedelse / 5.2 Arbeidsoppgaver, linje 3917–3920 og 3988–3992 |
| training_problem | analysis_01_possession | 6. Kapmpanalyse – 1 Possession |
| training_problem | analysis_02_support | 6. Kapmpanalyse – 2 Støtte |
| training_problem | analysis_03_communication | 6. Kapmpanalyse – 3 Kommunikasjon |
| training_problem | analysis_04_delay | 6. Kapmpanalyse – 4 Forsinkelse i forsvar / 2. Defensivt – Forsink |
| training_problem | analysis_05_penetration | 6. Kapmpanalyse – 5 Gjennombrudd |
| training_problem | analysis_06_concentration | 6. Kapmpanalyse – 6 Konsentrering i forsvar / 2. Defensivt – Komprimering/Sideforskyvning |
| training_problem | analysis_07_width | 6. Kapmpanalyse – 7 Bredde i angrep / Etablert angrep |
| training_problem | analysis_08_movement | 6. Kapmpanalyse – 8 Bevegelse i angrep |
| training_problem | analysis_09_balance | 6. Kapmpanalyse – 9 Balanse i forsvar / 2. Defensivt – Risiko og balanse |
| training_problem | opponent_attack | 6. Kapmpanalyse – Hvordan identifisere motsanders karakteristika |
| training_problem | opponent_defence | 6. Kapmpanalyse – Hvordan identifisere motsanders karakteristika / Formasjonen |
| coaching_transfer | match_periodization | 5.3 Strategi, linje 3993–4010 |
| coaching_transfer | match_balance_choices | 5.3 Strategi – Bestem / Back og innoverving, linje 3998–4007 |
| coaching_transfer | match_adjustments | 5.3 Strategi – Spillalternativer i.f.t. motstander, linje 4010–4027 |

## Bolk 9 – pedagogikk og treningsmetodikk

12 søkbare fagavsnitt i fem eksisterende treningskapitler, forankret i PDF 2.7 Kritiske perspektiver, 3.0 Trening og øvelser (linje 420–630), 3.3–3.4 Pedagogiske modeller og Sosiologi (linje 4025–4157), samt tidligere persepsjons-, possession- og kontringsavsnitt. Øvelsesvariantene beskrives i boka, ikke som nye øvelses-ID-er eller endringer i treningsmotoren. Eksakte banemål, dosering og uutfylte teorideler er ikke konstruert. Manusets kildereferanser, direkte sitater og kvantitative forskningspåstander er ikke selvstendig verifisert. Godfoten, Frade, Seirul·lo, Dreier og Descamps er i denne pedagogikkdisposisjonen navngitt uten full metodebeskrivelse; de er markert for videre fordypning, ikke presentert som ferdig integrerte metodikker. Ingen nye hovedkapitler, figurer eller motorregler. Full CI og OneNote-kontroll gjenstår.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| exercise_constraints | constraints_led | 3.0 Trening og øvelser – Finter og 1v1 / 3.4 Pedagogiske modeller / Sportsvitenskapelige perspektiver |
| exercise_constraints | rondo_practice | 3.0 Trening og øvelser – Pasningsøvelser |
| exercise_constraints | duel_practice | 3.0 Trening og øvelser – Finter og 1v1-situasjoner / 3.4 Fotballfaglige og praktiske implikasjoner |
| exercise_constraints | scanning_practice | 3.0 Orientering og scanning / 3.2 Persepsjon – Trenerøvelse |
| exercise_constraints | restriction_practice | 3.0 Ballkontroll og restriksjoner / 3.4 Fotballfaglige og praktiske implikasjoner |
| coaching_transfer | play_practice | 3.4 Pedagogiske modeller / 2.7 Trenerens dilemma |
| coaching_transfer | guided_discovery | 3.4 Pedagogiske modeller / 2.7 Trenerens dilemma |
| coaching_transfer | contextual_technique | 2.7 Overfokus på triks / Kontekstualisering av teknikk / 3.0 Spillnærhet og helhet |
| individual_development | early_specialization | 2.7 Tidlig spesialisering og press på unge spillere |
| individual_development | learning_environment | 2.7 Sosiale og økonomiske skjevheter / 3.4 Sosiologi – Kulturelle læringsmiljøer |
| collective_training | possession_counter_practice | Ballbesittelse / Konservering / Overgang–Kontring |
| load_recovery | training_periodization | 3.3 Pedagogiske modeller – Periodisering & treningsfilosofier / 3.4 Pedagogiske modeller |

## Bolk 10 – sportsvitenskap og fysiologi (delvis dekning)

Seks søkbare fagavsnitt i individual_development og load_recovery. PDF linje 392–400, 780–787, 4105–4167 samt relevante tidligere teknikk-, motorisk læring- og pressavsnitt. Motorisk læring og nevromuskulær samordning har sammenhengende fagtekst i PDF-en; de øvrige fysiologiavsnittene er uttrykkelig disposisjonsbaserte. Kontroll mot arkivets delvise OneNote-uttrekk fra Fotballteori (Den 12.06.2026).one bekrefter disposisjonene ved byte 0x00007b84, 0x00008d04, 0x0000e434 og 0x001b05f8, samt nevromuskulær tekst ved 0x001af314. Ingen utførlig fysiologiblokk identifisert i de tilgjengelige uttrekkene. Dette utelukker ikke at den finnes i ulesbare eller ikke-ekstraherte OneNote-data. Notasjonen restitusjon <70 % mangler målereferanse og er ikke en anbefaling. De fire hurtighetslekene registreres som navn, ikke ferdig øvelsesinnhold. Tønnesen/Olympiatoppen, Hargreaves og Okwonga er kildepekere, ikke selvstendig verifiserte referanser. Ingen nye motorverdier, medisinske råd, dosering, treningsøvelses-ID-er, figurer eller kapitler.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| individual_development | physical_resources | 6. Fysiologi / 4. Fysiske ferdigheter / Sportsvitenskap og fysiologi |
| individual_development | motor_learning | 3.0 Ballkontroll og restriksjoner / 3.4 Sportsvitenskapelige perspektiver |
| individual_development | neuromuscular_control | 3.4 Sportsvitenskapelige perspektiver / Nevromuskulær forskning |
| individual_development | balance_proprioception | 6. Fysiologi – Balanse / Sportsvitenskap og fysiologi / 3.1 Individuelle angrepsferdigheter |
| load_recovery | speed_training_outline | 6. Fysiologi – Hurtighet / 2. Defensivt – Pressbølger |
| load_recovery | speed_play_outline | 6. Fysiologi – Hurtighet / Lek |

**Åpent:** Full fysiologiblokk med utholdenhet, spenst/hurtighet, styrke, bevegelighet, balanse, skadeforebygging, konkrete hurtighetsdrag og lekregler; avklar måleenhet for restitusjonsnotasjonen. Full CI og OneNote-gjennomgang gjenstår.

## Bolk 11 – psykologi og mental trening (delvis dekning)

Åtte søkbare fagavsnitt i individual_development, coaching_transfer og collective_training. PDF 7. Det mentale aspektet (linje 789–801) og 2. Psykologi og mental trening (4269–4276) er disposisjoner, ikke den komplette mentale hovedblokken. De sammenhengende praksispassasjene om mentale faktorer ved avslutning (2222–2228, 2487–2495), mentale bilder og orientering (2537–2570), reaksjon etter balltap (1620–1657), kommunikasjon og kampklima (3654–3696) og estetikkens psykologi (4421–4433) er integrert. Målsetting, relativ suksess, nivå, maksimal innsats, nerveforberedelser, vinnermentalitet og lagånd er bevart som disposisjonstemaer uten å rekonstruere manglende innhold. Ingen nye psykologiske tester, treningsdoser, spillerverdier eller motorregler. Personnavn i disposisjonen er kilde-/casepekere, ikke grunnlag for karakteristikker av personers psykiske helse. Uverifiserte sitater er ikke publisert som autentiske. OneNote-dekning er ikke kontrollert særskilt i denne bolken; full sideeksport gjenstår.

| Kapittel-ID | Underavsnitt-ID | Kildeanker |
|---|---|---|
| individual_development | mental_development_outline | 7. Det mentale aspektet, linje 789–801 |
| individual_development | confidence_finishing | 3.1.2 Angrepsavslutning – Mentale faktorer, linje 2222–2228 og 2487–2495 |
| individual_development | mental_images | 3.2 Persepsjon / Orientering, linje 2537–2570 |
| individual_development | goals_effort_outline | 7. Det mentale aspektet, linje 790–799 / 2. Psykologi og mental trening, linje 4269–4276 |
| coaching_transfer | mental_reset | 2. Defensivt – Omstilling / Gjenvinning, linje 1620–1657 / Kommunikasjon, linje 3675–3682 |
| coaching_transfer | mental_match_climate | Kommunikasjon, linje 3661–3682 / Kontringsmønstre – 4-mot-2 / 7. Det mentale aspektet |
| coaching_transfer | style_psychology | Del IV – Estetikk, kultur og filosofi / Psykologiske aspekter, linje 4421–4433 |
| collective_training | team_spirit_outline | 7. Det mentale aspektet / 2. Psykologi og mental trening / Kommunikasjon, linje 789–801, 4269–4276 og 3654–3696 |

**Åpent:** Full mental hovedblokk, målsettingsmetode, innsatsbegrep, stress og nerver, konkrete kildehenvisninger og casebeskrivelser. Full CI og OneNote-gjennomgang gjenstår.

## Bolk 12 – ferdigstilt fysiologi som redaksjonell fagfordypning

På brukerens bestilling om å fullføre fysiologi er 15 nye fagavsnitt lagt til i individual_development, load_recovery og exercise_constraints. Alle merkes med «Faglig tillegg» og ligger ved siden av de seks originalbaserte avsnittene fra bolk 10. Dette fullfører tematisk fagdekning, men ikke gjenfinning av den manglende originalblokken. Ingen originaltekst eller eksisterende øvelser er fjernet. Tre lekvarianter er nye redaksjonelle forslag, Snipp og Snapp er tilpasset fra Aktivitetsbanken. Den konkrete sprintøkten er et illustrativt vokseneksempel basert på generelle sprint- og oppvarmingsprinsipper, ikke et ordrett Tønnessen-program. Restitusjonsnotasjonen <70 % og George Best-eksemplet forblir uavklarte i originalen. Kildegrunnlaget er eksternt og markert per avsnitt. Ingen medisinske terskler, nye øvelses-ID-er, motorregler eller spillerverdier. Full CI og OneNote-gjennomgang gjenstår.

### Kilder til fagtillegg

- Performance Adaptations to Intensified Training in Top-Level Football (2022), https://pmc.ncbi.nlm.nih.gov/articles/PMC9667002/
- Strength and Conditioning for Soccer Players (2014), https://doi.org/10.1519/SSC.0000000000000054
- Assessment of Aerobic Fitness and Repeated Sprint Ability in Elite Male Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40220211/
- Haugen, Seiler, Sandbakk og Tønnessen (2019), The Training and Development of Elite Sprint Performance, https://doi.org/10.1186/s40798-019-0221-0
- Olympiatoppen – Oppvarming før trening og konkurranse, https://www.olympiatoppen.no/fagomrader/utholdenhet/fagstoff/oppvarming/
- Olympiatoppen – Bevegelighet med tanke på utvikling av mobilitet, https://www.olympiatoppen.no/fagomrader/motorikk-og-ferdighetsutvikling/fagstoff/bevegelighet-med-tanke-pa-utvikling-av-mobilitet/
- Skadefri – Fotball, https://www.skadefri.no/idretter/fotball
- Skadefri – Skadefri fotball, https://skadefri.no/idretter/fotball/skadefri-fotball/
- Proske og Gandevia (2012), The proprioceptive senses, https://pubmed.ncbi.nlm.nih.gov/23073629/
- Effect of specific exercise-based football injury prevention programmes (2017), https://pubmed.ncbi.nlm.nih.gov/28087568/
- Olympiatoppen – Treningsdagbok som verktøy, https://olympiatoppen.no/fagomrader/utholdenhet/fagstoff/treningsdagbok-som-verktoy-for-optimalisering-av-treningsprosessen/
- Evidence-Based Recovery in Soccer (2022), https://pubmed.ncbi.nlm.nih.gov/36196351/
- The Time Course of Postmatch Physical Impairments in Professional Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40845278/
- Aktivitetsbanken – Snipp og Snapp, https://aktivitetsbanken.no/basis/ovelser/snipp-og-snapp-1/

| Kapittel-ID | Underavsnitt-ID |
|---|---|
| individual_development | phys_energy |
| individual_development | phys_endurance |
| individual_development | phys_strength |
| individual_development | phys_power |
| individual_development | phys_mobility |
| individual_development | phys_proprio |
| load_recovery | phys_acceleration |
| load_recovery | phys_speed_session |
| load_recovery | phys_injury_prevention |
| load_recovery | phys_monitoring |
| load_recovery | phys_recovery |
| exercise_constraints | phys_play_snipp |
| exercise_constraints | phys_play_soldat |
| exercise_constraints | phys_play_number |
| exercise_constraints | phys_play_pair |

## Bolk 13 – ferdigstilt psykologi som redaksjonell fagfordypning

14 nye fagavsnitt i fire eksisterende treningskapitler. Alle er eksplisitt merket «Faglig tillegg» og har eksterne kildelenker; de åtte originalbaserte avsnittene fra bolk 11 beholdes uendret. Temaene i originalens disposisjon er utdypet med motivasjon, målsetting/relativ suksess, mestringstro, enkelhet ved formsvikt, visualisering, konsentrasjon, indre dialog, spenningsregulering, kampforberedelse, innsats, refleksjon, lagånd og vinnermentalitet. To nye redaksjonelle øvelsesvarianter knytter psykologi til kampatferd. Eksempler er pedagogiske anvendelser, ikke forskningsvaliderte fotballprotokoller eller gjenfunnet originaltekst. Uverifiserte Lampard-, Herrera- og Okwonga-attribusjoner og personcaser står fortsatt som åpne kildepunkter. Forskning på mentale intervensjoner har varierende kvalitet og effekt; ingen prestasjonsgarantier, nye mentale spillerverdier, diagnoser, motorregler eller øvelses-ID-er. Tematisk ferdigstilt, men den manglende originale hovedblokken er ikke gjenfunnet. Full CI og OneNote-gjennomgang gjenstår.

### Kilder til fagtillegg

- Olympiatoppen – Idrettspsykologi, tjenester og fagområder, https://olympiatoppen.no/fagomrader/idrettspsykologi/tjenester/
- Autonomy support in sport and exercise settings: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2031252
- Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/
- The performance and psychological effects of goal setting in sport: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2116723
- The what, why, and how of goal setting: a review of the goal-setting process in applied sport psychology practice (2023), https://doi.org/10.1080/10413200.2023.2185699
- The effectiveness of pre-performance routines in sports: a meta-analysis (2021), https://doi.org/10.1080/1750984X.2021.1944271
- The Effects of Imagery Practice on Athletes' Performance: A Multilevel Meta-Analysis with Systematic Review (2025), https://pubmed.ncbi.nlm.nih.gov/40426460/
- Effects of Psychological Interventions to Enhance Athletic Performance: A Systematic Review and Meta-Analysis, https://pubmed.ncbi.nlm.nih.gov/37812334/
- Hatzigeorgiadis mfl. (2011), Self-Talk and Sports Performance: A Meta-Analysis, https://doi.org/10.1177/1745691611413136
- Performance Under Pressure in Sport: A Position Statement from Exercise and Sports Science Australia (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC13457279/
- Analyzing the impact of team-building interventions on team cohesion in sports teams: a meta-analysis study (2024), https://pubmed.ncbi.nlm.nih.gov/38558775/

| Kapittel-ID | Underavsnitt-ID |
|---|---|
| individual_development | mental_motivation |
| individual_development | mental_relative_success |
| individual_development | mental_self_efficacy |
| individual_development | mental_imagery_practice |
| individual_development | mental_attention |
| individual_development | mental_self_talk |
| coaching_transfer | mental_arousal |
| coaching_transfer | mental_preparation |
| coaching_transfer | mental_effort |
| coaching_transfer | mental_reflection |
| collective_training | mental_team_cohesion |
| collective_training | mental_winning |
| exercise_constraints | mental_pressure_practice |
| exercise_constraints | mental_reset_practice |

## Bolk 14 – fotballhistorie: fra kaos til kollektiv intelligens

14 søkbare fagavsnitt i seks eksisterende teori- og skolekapitler. PDF Del I, Del II (linje 1–390), Kognitive ferdigheter / Kvinnefotball (4170–4264) og Del V (4519–4650). Historiske holdepunkter kontrollert mot Scottish Football Museum, FIFA, UEFA, FC Barcelona og FIFA Training Centre der lenker er angitt. Originalarkivet endres ikke. Uverifiserte sitater og detaljerte årsaksforklaringer er utelatt. Offsideformuleringen om 1866, etableringen av La Masia og påstanden om den første ballspillende keeperen avgrenses eller korrigeres eksplisitt. Kontinentale påvirkningslinjer og WM-historie er ikke fullt kildeverifisert. Klasse, teknologi, estetikk, kultur, filosofi og biografiske case behandles separat. Ingen nye hovedkapitler, figurer eller motorregler. Full CI og OneNote-kontroll gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| formations | history_chaos | Del I – Fra kaos til form / Overgang fra individer til systemer |
| formations | history_combination | Del I – Skottland mot England; Scottish Football Museum, https://www.scottishfootballmuseum.org.uk/football-for-all/scotlands-football-origins/ |
| formations | history_rules | Del I – Regelendringer som katalysator |
| formations | history_continent | Del I – Kontinentale impulser: Østerrike, Sveits, Ungarn |
| formations | history_wm | Del I – Formasjoner og tidlige systemer / WM-formasjonen og moderniseringen |
| formations | history_brazil | Del I – Brasils 4-2-4; FIFA, https://www.fifa.com/pt/news/articles/morre-zagallo-homenagem-fifa |
| formations | history_women | Sportsvitenskap og fysiologi – Kvinnefotball og alternative perspektiver; FIFA, https://www.fifa.com/en/tournaments/womens/womensworldcup/articles/facts-history-launch-start |
| false_nine_inverted_back | history_hungary | Del I – Ungarn på 50-tallet; FIFA, https://www.fifa.com/en/news/articles/hungary-magical-magyars-puskas-hidegkuti-england-wembley-1953-six-three ; https://inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/are-england-s-years-of-hurt-about-to-come-to-an-end |
| total_football | history_total | Del I – Cruyff og totalfotballen; UEFA, https://www.uefa.com/uefachampionsleague/news/0230-0e94a8068d01-a93b114660e2-1000--in-profile-rinus-michels/ |
| total_football | history_collective_cognition | Sportsvitenskap og fysiologi – Kognitive ferdigheter og psykologiske krav |
| catenaccio | history_catenaccio | Del I – Italiensk catenaccio og sweeper-logikken; UEFA, https://www.uefa.com/uefachampionsleague/news/0231-0e94dd0ff999-827e03392bff-1000--in-profile-helenio-herrera/ |
| positional_play | history_cruyff_barca | Del I – Cruyff og totalfotballen / Del II – Totalfotball og moderne kollektivitet; FC Barcelona, https://www.fcbarcelona.com/en/news/1457129/la-masia-is-40-years-old/amp |
| positional_play | history_keeper | Del V – Guardiola og positional play 2.0; FIFA Training Centre, https://www.fifatrainingcentre.com/en/practice/elite-sessions/goalkeeper/goalkeepersbuildup.php ; FIFA, https://www.fifa.com/en/articles/gyula-grosics-hungary-goalkeeping-legacy |
| gegenpress | history_intensity | Del V – Moderne krav / Klopp og gegenpressing; FIFA Training Centre, https://www.fifatrainingcentre.com/en/practice/elite-sessions/transition-to-defending/counter-pressing.php |

## Bolk 15 – estetikk, kultur og filosofi

15 søkbare fagavsnitt i eksisterende teori-, skole- og treningskapitler, basert på PDF Del IV (4280–4519), Del I (klasse og baneforhold), Del II (kultur og kontekst), 2.7 (sosial tilgang), 3.4 (sosiologi) og teknologiavsnittet (4170–4199). Manusets egne fortolkninger av Bourdieu, Adorno, Eco, Elias, Gadamer og Aristoteles beholdes som fotballfilosofiske anvendelser, ikke sitater eller fullstendige gjengivelser av originalverk. Aristoteles-distinksjonen presiseres med ekstern fagkilde, og brede nasjonale karakteristikker avgrenses. FIFA-holdepunkter og forskningsartikkel om Sócrates/Corinthians-demokratiet er kontrollert og oppgitt ved relevante avsnitt. Øvrige sitater og detaljerte historiske årsaksforklaringer er ikke uavhengig kontrollert. Ingen nye hovedkapitler, illustrasjoner eller motorregler; originalarkivet uendret. Spiller-/trenercase, separat dødballdekning og full OneNote-gjennomgang gjenstår. Full CI er ikke verifisert.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| total_football | culture_art_results | Del IV – Estetikk og resultater / Avslutning: Estetikk som grunnvilkår |
| catenaccio | culture_pragmatism | Del IV – Estetikk og resultater |
| individual_development | culture_habitus_field | Del IV – Bourdieu: Habitus og felt / 3.4 Sosiologi |
| individual_development | culture_symbolic_capital | Del IV – Estetikk som kapital |
| individual_development | culture_access_class | Del I – Klasse, kultur og profesjonalisering / 2.7 Sosiale og økonomiske skjevheter |
| exercise_constraints | culture_material_conditions | Del I – Banekvalitet og materielle forhold / Teknologi, banekvalitet og treningsmetoder |
| total_football | culture_adorno | Del IV – Filosofi og estetikk; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/adorno/ |
| total_football | culture_eco | Del IV – Teoretiske perspektiver / Umberto Eco |
| formations | culture_elias | Del IV – Teoretiske perspektiver / Norbert Elias |
| total_football | culture_gadamer | Del IV – Filosofiske utdypinger / Gadamer; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/gadamer-aesthetics/ |
| total_football | culture_aristotle | Del IV – Filosofiske utdypinger / Aristoteles; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/episteme-techne/ |
| relationism | culture_identity | Del IV – Sosiokulturelle dimensjoner |
| formations | culture_regional_examples | Del II – Ferdigheter i kultur og kontekst; FIFA, https://www.fifa.com/en/articles/world-cup-qatar-2022-surprises-that-shook-the-world ; https://www.fifa.com/en/tournaments/mens/worldcup/articles/asia-best-moments |
| collective_training | culture_socrates | Del IV – Sócrates – doktoren som ledet revolusjonen; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1982spain/news/tele-and-his-gods-of-82 ; Playing for freedom: Sócrates, futebol-arte and democratic struggle in Brazil, https://doi.org/10.1080/14660970.2014.912014 |
| total_football | culture_synthesis | Del IV – Avslutning: Estetikk som grunnvilkår / Del V – System vs. individ / Arven |

## Bolk 16 – dødballer og spesialsituasjoner

10 søkbare fagavsnitt i alle fem eksisterende dødballkapitler. PDF 1.2 Straffer (1089–1104), 1.5 Dødball (1199–1203), Lås av (1594–1601), Defensiv Dødball (1855–1866), Angrepsavslutning (2487–2525), Offensiv dødball (3316–3346), Kommunikasjon (3707–3712) og Klarering (3775–3792). Manusets leveringspreferanser, defensive stolpeansvar, lås av, offensiv markering og overgangsvariant er bevart. IFAB gjeldende regler 11, 12, 13 og 14 er kontrollert; ulovlig hindring, holding og usportslig forstyrrelse av skytter presenteres ikke som taktiske instruksjoner. Uverifiserte straffestatistikker og keeperanekdoter er avgrenset. Defensiv frispark er en tom overskrift i kilden; full offensiv innkastvariant er ikke beskrevet. Eksisterende fagtekst dekker disse temaene uten å utgi seg for originalen. Ingen nye hovedkapitler, figurer, motorregler eller øvelses-ID-er. Full CI, personcaser og komplett OneNote-kontroll gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| attacking_corners | corner_low_delivery | Offensiv dødball – Corner, linje 3316–3333 / Tre angrepstyper |
| attacking_corners | corner_disguise | Offensiv dødball – Corner, linje 3322–3346; IFAB regel 12, https://www.theifab.com/laws/latest/fouls-and-misconduct/ |
| free_kicks | free_kick_targets | Offensiv dødball – Frispark, linje 3334–3346; IFAB regel 11 og 13, https://www.theifab.com/laws/latest/offside/ ; https://www.theifab.com/laws/latest/free-kicks/ |
| free_kicks | penalty_kicker | Angrepsavslutning – Mentale faktorer / Straffe, linje 2487–2495 og 2521–2525; IFAB regel 14, https://www.theifab.com/laws/latest/the-penalty-kick/ |
| free_kicks | penalty_keeper | Keeper – Straffer, linje 1089–1104; IFAB regel 14, https://www.theifab.com/laws/latest/the-penalty-kick/ |
| throw_ins | restart_lock | 2. Defensivt – Lås av, linje 1594–1601; IFAB regel 11, https://www.theifab.com/laws/latest/offside/ |
| marking_blocks | corner_defence_posts | Defensiv Dødball – Defensiv corner, linje 1855–1860; IFAB regel 12, https://www.theifab.com/laws/latest/fouls-and-misconduct/ |
| marking_blocks | restart_organize | Keeper 1.5 Dødball, linje 1199–1203 / Situasjonsavhengig posisjonering, 958–963 / Kommunikasjon, 3707–3712 / Defensiv frispark, 1866 |
| second_ball_security | offensive_marking_restart | Defensiv Dødball – Offensiv markering, linje 1859–1866 / Keeper 1.5 Dødball |
| second_ball_security | clearance_counter_restart | Klarering, linje 3775–3792 |
