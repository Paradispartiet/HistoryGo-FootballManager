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

## Bolk 17 – spiller- og trenercase (første integrasjon)

12 søkbare fagavsnitt i eksisterende rolle- og skolekapitler. Gjenbruker konkrete beskrivelser i PDF Del I, 1.1–1.3 Keeper, 3.2 Persepsjon, Del IV og Del V. FIFA, UEFA og Manchester City kontrolleres der eksterne lenker angis. Faglige eksempler fra manus er ikke bevis for rangering eller fullstendig biografi. Personcaser om Sócrates, Bourdieu-eksemplene, historisk WM og øvrige skoler finnes allerede i bolk 14–15. Ingen nye motorverdier eller hovedkapitler. Uverifiserte personanekdoter, psykologiske og kriminelle merkelapper samt tillagte sitater publiseres ikke som fakta.

### Navn i disposisjonen som krever egen fordypning

- Epokeikoner: Billy Meredith, William McGregor, Giuseppe Meazza, Stanley Matthews, Garrincha, Pelé, Eusébio.
- Arkitekter og ledere: Herbert Chapman, Vittorio Pozzo, Di Stéfano, Beckenbauer, Matthäus, Lahm.
- Grunnferdigheter og spesialister: Bergkamp, De Bruyne, Okocha, Neymar, Messi, Van Basten, Shearer, Haaland, Beckham, Juninho Pernambucano, Pirlo, Rivelino.
- Fysiske ferdigheter: Henry, Mbappé, Ronaldo Fenomenet, Drogba, Lukaku, Kanté, Makélélé, Cristiano Ronaldo, Maldini, Modrić, Zlatan.
- Kultur, kreativitet og regionale eksempler: Romário, Weah, Yaya Touré, Nakata, Park Ji-sung, Son Heung-min, Tom Lund, Gamst Pedersen, Jesper Grønkjær, Baggio, Zola, Ravanelli, Kanu, Strandli, Leonhardsen.
- Trenerfordypning: Rangnick, Tuchel, Mourinho, Wenger, Ferguson, Ranieri, Drillo. Eksisterende klubb- og skolekapitler kan dekke deler av disse; navn alene er ikke fullstendig kildedekning.

Dette er en prioritert oversikt over uutfylte eksempler, ikke komplette nye portretter. Originalens øvrige navnelister bevares i arkivet. Full OneNote-eksport og CI gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| keepers | portrait_keeper_depth | 1.1 Posisjonering / Linjekeepere vs sweeper-keepere, linje 838–949 |
| keepers | portrait_keeper_angles | 1.1 Vinkelkontroll / Dybdejustering / 1.2 Grunnprinsipper; UEFA, https://www.uefa.com/uefaeuro/history/news/025d-0f6f811b9339-3bdefd2fd076-1000--euro-92-spotlight-how-brilliant-was-denmark-s-peter-schme/ |
| keepers | portrait_keeper_saves | 1.1 Sideforflytning / Posisjonering mot innlegg / 1.2 Skuddstopping, linje 880–1087 |
| keepers | portrait_keeper_distribution | 1.3 Distribuering, linje 1110–1183 / Del V – Ederson; Manchester City, https://www.mancity.com/news/mens/ederson-fulham-preview-premier-league-63863644 |
| link_strikers | portrait_hidegkuti | Del I – Ungarn på 50-tallet; FIFA, https://www.fifa.com/en/news/articles/hungary-magical-magyars-puskas-hidegkuti-england-wembley-1953-six-three |
| finishing_press | portrait_puskas | Del I – Puskás og Hidegkuti, linje 139–150; FIFA, https://www.fifa.com/en/news/articles/hungary-magical-magyars-puskas-hidegkuti-england-wembley-1953-six-three |
| six_regista | portrait_scanning | 3.2 Persepsjon, linje 2537–2570 |
| ten_creator | portrait_creative | Del IV – Estetikk og resultater / Del V – System vs. individ |
| total_football | portrait_cruyff_michels | Del I – Cruyff og totalfotballen; UEFA, https://www.uefa.com/uefachampionsleague/news/0253-0d7ff54908f6-5927d0a16600-1000--the-greatest-teams-of-all-time-ajax-1971-73/ |
| catenaccio | portrait_herrera | Del I – Italiensk catenaccio / 7. Det mentale aspektet |
| gegenpress | portrait_klopp | Del V – Klopp og gegenpressing / Moderne mestre, linje 4557–4623 |
| positional_play | portrait_guardiola_ederson | Del V – Guardiola og positional play 2.0, linje 4591–4617; Manchester City, https://www.mancity.com/news/mens/ederson-fulham-preview-premier-league-63863644 |

## Bolk 18 – kildebelagte faglige personcase (tillegg)

9 nye avsnitt om navn fra originaldisposisjonen, med eksterne kilder og tydelig merking «Faglig tillegg». Historiske fakta kontrollert mot SNL, LSK, Brann, FIFA, UEFA, EFL, FIGC og Welsh Sports Hall of Fame; pedagogiske observasjonsoppgaver er nye anvendelser, ikke dokumenterte kampsekvenser. Navngitte personer uten egne avsnitt står fortsatt i bolk 17 sitt register; dette er ikke full portrettdekning. Ingen illustrasjoner, kapitler eller motorverdier endret. Full CI og OneNote-gjennomgang gjenstår.

| Kapittel | Underavsnitt | Ekstern kilde |
|---|---|---|
| ten_creator | portrait_tom_lund | Lillestrøm SK, https://www.lsk.no/nyheter/tusen-takk-for-alt-tommy ; Store norske leksikon, https://snl.no/Tom_Lund |
| eight_press | portrait_leonhardsen | Store norske leksikon, https://snl.no/%C3%98yvind_Leonhardsen |
| finishing_press | portrait_strandli | SK Brann Historie, https://historie.brann.no/spillere/frank-strandli/ |
| wingers | portrait_mathews_garrincha | UEFA, https://www.uefa.com/news-media/news/021e-0f8a84ac44d9-bf9f306f255c-1000--the-wizard-of-dribble-sir-stanley-matthews/ ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/garrincha-goal-brazil-chile-1962 |
| formations | portrait_meredith_mcgregor | Welsh Sports Hall of Fame, https://welsh-sports-hall-of-fame.wales/hall-of-fame/billy-meredith/ ; EFL, https://www.efl.com/about-the-efl/history/ |
| finishing_press | portrait_meazza_eusebio | FIGC, https://www.figc.it/it/full-html?path=%2Fmuseo-del-calcio%2Fhall-of-fame%2Friconoscimenti-alla-memoria%2Fgiuseppe-meazza ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/portugal-korea-dpr-eusebio-england-1966 |
| link_strikers | portrait_pele | FIFA, https://www.fifa.com/pt/tournaments/mens/worldcup/articles/brasil-suecia-final-copa-1958 ; https://www.fifa.com/en/articles/a-tribute-to-pele-brazil-santos-new-york-cosmos-legend-fifa-world-cup |
| free_kicks | portrait_juninho_beckham_pirlo | UEFA, https://www.uefa.com/uefachampionsleague/news/0271-142ab5eaac54-565b3cc3cec4-1000--the-best-free-kicks-in-uefa-champions-league-history/ ; https://www.uefa.com/uefachampionsleague/news/01b2-0e6d65fc4647-b5a0bb928927-1000--juninho-strike-leaves-lyon-on-top/ ; FourFourTwo, https://www.fourfourtwo.com/features/best-free-kick-taker-ever-juninho-pernambucano-how-he-got-so-good |
| transition_attack | portrait_drillo | Store norske leksikon, https://snl.no/Egil_Olsen ; UEFA, https://www.uefa.com/european-qualifiers/news/01d5-0f85a69d71f2-db2bcddf3c1c-1000--olsen-returns-hungry-for-more/ |

## Bolk 19 – tekniske og taktiske angrepsprofiler

9 fagtillegg i eksisterende rolle- og teorikapitler. Åtte navngitte spillerprofiler samt én sammenligning av rollepar. Originalmanusets konkrete opp–tilbake–gjennom (Bergkamp), to tiere (De Bruyne), tredjemannsbevegelse (Van Basten) og Shearers løp er åpnet på nytt. Den motstridende Shearer-statistikken (13 løp per sjanse / per ballkontakt) brukes ikke som fakta. Historiske eksempler avgrenses mot observerbare kampklipp og analyser fra FIFA, FIFA Training Centre, UEFA og Premier League. Observasjonsoppgaver og rolleparsammenligning er nye pedagogiske anvendelser, ikke motorregler eller dokumenterte historiske ruter. Originalavsnitt og eksisterende illustrasjoner er beholdt. Full CI og OneNote-kontroll gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| link_strikers | portrait_bergkamp | PDF linje 3458–3467; Premier League, https://www.premierleague.com/en/news/2147353 ; https://www.premierleague.com/en/news/2737302 |
| ten_creator | portrait_de_bruyne | PDF linje 3899–3903; Premier League, https://www.premierleague.com/en/news/2915555 ; https://www.premierleague.com/en/news/4019681 |
| ten_creator | portrait_messi | PDF Del V, linje 4624–4645; FIFA Training Centre, https://www.fifatrainingcentre.com/en/game/game-analysis/world-class-tactics/argentina--ball-proximity-in-possession.php ; https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php |
| wingers | portrait_okocha | PDF Del II og linje 735–737; FIFA, https://www.fifa.com/en/news/articles/jay-jay-okocha-usa-1994-nigeria-italy ; https://collect.fifa.com/collectible/2843034856 |
| wingers | portrait_neymar | PDF linje 4050–4058 og 4155–4160; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/neymar-goal-brazil-2022-croatia?searchOverlay=1 ; https://collect.fifa.com/collectible/1093913151 |
| finishing_press | portrait_van_basten | PDF linje 3443–3447; UEFA, https://www.uefa.com/uefaeuro/history/news/0252-0ce2a8e3dd0f-2b753b1365a3-1000--marco-van-basten-on-euro-1988-and-that-volley/ ; https://www.uefa.com/uefaeuro/history/news/025d-0f859f66fcba-c8d3aa08dfa3-1000--classics-soviet-union-vs-netherlands-1988/ |
| finishing_press | portrait_shearer | PDF linje 2199–2205 og 2446–2451; Premier League, https://www.premierleague.com/en/news/846527 ; https://www.premierleague.com/en/news/845999 |
| finishing_press | portrait_haaland | PDF Del II, linje 273–276; Premier League, https://www.premierleague.com/en/news/2915555 ; FIFA Training Centre, https://www.fifatrainingcentre.com/en/resources-tools/football-language/in-possession/movement-to-receive/index.php |
| third_man | portrait_bergkamp_henry_debruyne_haaland | PDF linje 3458–3467; Premier League, https://www.premierleague.com/en/news/2785853 ; https://www.premierleague.com/en/news/2915555 |

## Bolk 20 – fysiske spesialister og allroundere

13 nye fagtillegg i rolle- og treningskapitler. Originalens liste over fysiske eksempler (PDF 392–400) er nå tematisk dekket, inkludert Pelé fra bolk 18. Henry, Mbappé, Ronaldo Nazário, Drogba, Lukaku, Kanté, Makélélé, Cristiano Ronaldo, Maldini, Modrić og Zlatan; Matthäus og Lahm fra allrounderlisten (390). Kildene til nye historiske og taktiske holdepunkter er FIFA, FIFA Training Centre, UEFA, Premier League og klubbene. Observasjonsoppgaver og rollekrav er redaksjonelle anvendelser, ikke dokumenterte individuelle fysiske målinger eller fullstendige biografier. Ingen motorverdier, fysiske terskler, medisinske prognoser, øvelses-ID-er eller illustrasjoner endres. Originalavsnitt bevart; andre personnavn i bolk 17, full OneNote-kontroll og CI gjenstår.

| Kapittel | Underavsnitt | Ekstern kilde |
|---|---|---|
| finishing_press | portrait_henry | PDF 3458–3467; Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/thierry-henry |
| wingers | portrait_mbappe | FIFA Training Centre, https://www.fifatrainingcentre.com/en/game/individual-qualities/world-class-skills/mbappe-deceleration-to-acceleration2.php ; https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php |
| finishing_press | portrait_ronaldo_nazario | FIFA, https://inside.fifa.com/tournaments/mens/worldcup/2018russia/news/march-30-countdown-76-days-2935205 ; https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/seis-herois-das-finais-das-copas-do-mundo ; https://www.fifa.com/en/articles/kleberson-brazil-2002-fifa-world-cup-interview |
| link_strikers | portrait_drogba_lukaku | Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/didier-drogba ; https://www.premierleague.com/en/news/2211857 |
| eight_press | portrait_kante | UEFA, https://www.uefa.com/uefachampionsleague/news/0272-1487ed26f300-a4989534e012-1000--in-the-zone-chelsea-2-0-losc/ |
| six_regista | portrait_makelele | Chelsea FC, https://www.chelseafc.com/en/news/article/how-claude-makelele-changed-english-football |
| eight_press | portrait_matthaus | FIFA, https://www.fifa.com/en/articles/bayern-munich-club-profile-history-players-qualified ; https://www.fifa.com/en/tournaments/mens/worldcup/articles/west-germany-champions-stats |
| fullbacks | portrait_lahm | FC Bayern, https://fcbayern.com/en/club/hall-of-fame/philipp-lahm |
| centre_backs | portrait_maldini | AC Milan, https://www.acmilan.com/en/club/legends/player/paolo-maldini ; UEFA, https://www.uefa.com/uefachampionsleague/news/01a9-0e6cc45febef-9f10f83f46b9-1000--dutch-style-wins-maldini-over/ |
| eight_press | portrait_modric | UEFA, https://www.uefa.com/uefaeuro/history/news/028e-1b37474f637b-9784d3f1e6e4-1000--croatia-1-1-italy-analysis-the-magic-of-modric/ ; https://www.uefa.com/news/027b-169a7169dd60-6148d39469f8-1000--croatia-at-the-2022-world-cup/ |
| finishing_press | portrait_cristiano_heading | UEFA, https://www.uefa.com/uefaeuro/match/2017905--portugal-vs-wales/events/ |
| individual_development | portrait_zlatan_longevity | AC Milan, https://www.acmilan.com/en/news/articles/club/2023-12-11/redbird-capital-partners-press-release |
| individual_development | portrait_physical_role_comparison | FIFA Training Centre, https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php |

## Bolk 21 – trenerarkitekter

8 fagtillegg i eksisterende teori-, skole- og fasekapitler. Originalens arkitektliste (Del I), Del V (system vs. individ), Del II (Ranieri) og mønstereksemplet opp–tilbake–gjennom (3458–3467) er grunnlag for utvalget. Historiske holdepunkter kontrollert mot FIFA, Treccani, Jonathan Wilson, UEFA, Arsenal og Premier League. Pozzos metodo og Chapmans WM sammenlignes som formasjonseksempler; Rangnicks høye press og Ranieris overgangsmodell skilles fra hverandre. Tuchels formasjonsskifte og Mourinhos to semifinalekamper er avgrensede dokumenterte eksempler, ikke komplette historiske spillmodeller. Faglige observasjonsoppgaver er redaksjonelle tillegg. Ingen nye hovedkapitler, figurer, treningsdoser eller motorregler. Tidligere personcaser og originaltekst bevart. Full OneNote-gjennomgang og CI gjenstår.

| Kapittel | Underavsnitt | Ekstern kilde |
|---|---|---|
| formations | portrait_pozzo | FIFA, https://inside.fifa.com/tournaments/mens/worldcup/2018russia/news/20-march-countdown-86-days-2932639 ; Treccani, https://www.treccani.it/enciclopedia/calcio-la-storia-del-calcio_%28Enciclopedia-dello-Sport%29/ |
| formations | portrait_chapman | PDF linje 194–197; Jonathan Wilson, The Guardian, https://www.theguardian.com/football/blog/2011/sep/20/arsenal-herbert-chapman-southampton-tactics ; Treccani, https://www.treccani.it/enciclopedia/calcio-la-storia-del-calcio_%28Enciclopedia-dello-Sport%29/ |
| gegenpress | portrait_rangnick | UEFA, https://www.uefa.com/uefaeuro/history/news/028d-1b058a1a388d-5665645fc203-1000--uefa-euro-2024-meet-the-24-teams/ ; https://www.uefa.com/uefaeuro/history/news/028e-1b3f9d965e00-3ec1a6f8adb9-1000--euro-2024-group-stage-uefa-technical-observers-tactical-r/ |
| formations | portrait_tuchel | UEFA, https://www.uefa.com/uefachampionsleague/news/0274-14dc6f3757fd-ac23344fea44-1000--in-the-zone-chelsea-1-3-real-madrid-performance-analysis/ |
| catenaccio | portrait_mourinho | UEFA, https://www.uefa.com/uefachampionsleague/news/01e4-0e745dd6d8b8-559388d26824-1000--impressive-inter-leave-barca-on-the-ropes/ ; https://www.uefa.com/uefachampionsleague/news/01e4-0e746dee4629-e22f0b2f81cf-1000--barcelona-dethroned-by-resilient-inter/ |
| third_man | portrait_wenger | PDF linje 3458–3467; Arsenal FC, https://www.arsenal.com/feature/the-wenger-years-a05Ex7F5N6vd |
| formations | portrait_ferguson | Premier League, https://www.premierleague.com/en/news/4243787/the-4-4-2-football-tactics-explained |
| transition_attack | portrait_ranieri | Premier League, https://www.premierleague.com/en/news/2748139 |

## Bolk 22 – ledere, kulthelter, regionale profiler og samfunnsstemmer

13 fagtillegg med kildebelagte historiske holdepunkter. Originalens navnelister i Del I (246–279), Del II (350–414), Del IV (4470–4519) og mentaldisposisjonen (788–802) er brukt som register, ikke som utfylte biografier. Di Stéfano, Beckenbauer, Keane, Deschamps, Ramos, Zico, Baggio, Zola, Rivelino, Romário, Yaya Touré, Nakata, Park, Son, Gamst Pedersen, Grønkjær, Kanu, Ravanelli og Weah er nå tematisk representert. Samfunnscaset om Sócrates fra bolk 15 er beholdt. Originalens merkelapper om kriminalitet og psyke gjengis ikke som fakta; eventuelle separate personcase krever dokumenterte hendelser og relevant formål. Portrett av Ancelotti og øvrige navngitte trener-/spillerreferanser i brødteksten er ikke uttømmende kontrollert. Ingen nye motorregler eller illustrasjoner. Full OneNote-kontroll og CI gjenstår.

| Kapittel | Underavsnitt | Ekstern kilde |
|---|---|---|
| link_strikers | portrait_di_stefano | Real Madrid, https://www.realmadrid.com/en-US/the-club/history/football-legends/alfredo-di-stefano-laulhe |
| centre_backs | portrait_beckenbauer | FIFA, https://inside.fifa.com/organisation/news/a-tribute-to-franz-beckenbauer-1945-2024 ; https://inside.fifa.com/en/news/der-kaiser-turns-75 |
| collective_training | portrait_keane_deschamps | Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/roy-keane ; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/the-secrets-to-deschamps-longevity-with-les-bleus |
| marking_blocks | portrait_ramos | Real Madrid, https://www.realmadrid.com/en-US/news/club/latest-news/la-decima-cumple-diez-anos-24-05-2024 |
| ten_creator | portrait_zico_baggio_zola | FIFA, https://www.fifa.com/en/tournaments/mens/club-world-cup/usa-2025/articles/zico-flamengo-determination-love-passion ; https://www.fifa.com/en/archive/roberto-baggio ; Chelsea, https://www.chelseafc.com/en/news/article/chelseas-team-of-120-forward-gianfranco-zola |
| free_kicks | portrait_rivelino | FIFA, https://collect.fifa.com/collectible/182425449578756 |
| finishing_press | portrait_romario | FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/netherlands-brazil-dallas-usa-1994 ; https://www.fifa.com/en/tournaments/mens/worldcup/articles/jorginho-brazil-usa-1994 |
| eight_press | portrait_yaya_toure | Manchester City, https://www.mancity.com/news/first-team/first-team-news/2017/september/man-city-yaya-toure-longform-300-appearances |
| eight_press | portrait_nakata_park | AS Roma, https://www.asroma.com/en/news/44052/on-this-day-in-2001-watch-the-goals-in-the-famous-comeback-against-juve ; Manchester United, https://www.manutd.com/en/news/manchester-united-around-the-world-xi |
| wingers | portrait_son | Premier League, https://www.premierleague.com/en/news/1750634 ; https://www.premierleague.com/en/news/4271919/opta-analyst-elanga |
| wingers | portrait_gamst_gronkjaer | SNL, https://snl.no/Morten_Gamst_Pedersen ; Chelsea, https://www.chelseafc.com/en/news/article/beating-liverpool-in-2003 ; https://www.chelseafc.com/en/news/article/legends-from-overseas-added-to-squad-for-liverpool |
| finishing_press | portrait_kanu_ravanelli | Premier League, https://www.premierleague.com/en/news/2284536/black-history-month-heroes-nwankwo-kanu ; UEFA, https://www.uefa.com/uefachampionsleague/news/013d-0ea96a4b53b8-032c0735e213-1000--juventus-hold-their-nerve-to-seal-the-real-deal/ |
| collective_training | portrait_weah_romario_civic | FIFA, https://inside.fifa.com/campaigns/no-discrimination/media-releases/players-voice-panel-tackle-racism-in-football ; Brasils senat, https://www12.senado.leg.br/noticias/materias/2014/10/05/romario-e-eleito-senador |

## Bolk 23 – OneNote: automatisk dekningsindeks og første kildeintegrasjon

Originalenes SHA-256 er sammenlignet med originalarkivet, og begge OneNote-filer er byteidentiske. ZIP-integritet er kontrollert. Indeksen er generert lokalt fra de allerede dedupliserte binære tekstuttrekkene; råtekst og indeks lastes ikke opp til GitHub. Ingen komplett OneNote-sideeksport er tilgjengelig. Normalisering er Unicode NFKC, små bokstaver og ordsekvenser. For hvert råuttrekk er ordantall, eksakt sammenhengende PDF-treff og andel 8-ordsvinduer med steg 4 registrert. Dette er tekstlikhet, ikke ferdig faglig dekningskontroll eller andel av hele originalen.

| Uttrekk | Blokker | Minst 25 ord | Eksakt PDF-treff (minst 25 ord) | Ikke eksakt (minst 25 ord) |
|---|---:|---:|---:|---:|
| Fotballteori UTF-16 | 902 | 339 | 121 | 218 |
| Fotballnotater UTF-16 | 9 | 4 | 0 | 4 |
| Fotballnotater Windows-1252 | 61 | 6 | 1 | 5 |

De 218 lengre, ikke eksakt samsvarende teoriblokkene inkluderer 202 uten treff på 8-ordsvinduer. De kan inneholde utvidelser, alternative revisjoner, dubletter, referanser og dialogrester. Ikke likestill dette med 218 nye fagavsnitt. Korte notater er også relevante og må vurderes separat. Bilder, sidestruktur og gjeldende revisjon er ikke rekonstruert. Kildeankere nedenfor viser byteposisjoner i råuttrekket, ikke sidetall.

### Første redaksjonelle integrasjon

10 avsnitt med OneNote-kildeanker og eksplisitte avgrensninger. Notatene om pressretning ved balanse/ubalanse (0x000d2624), offensiv sidestopper (0x0000537c) og kontring (0x000f9810) er allerede tematisk dekket av press-, kampstrategi- og overgangskapitlene. Ikke dupliser. Droppunkt (0x000f2da4) har fortsatt uklar kontekst; ingen koordinatregel innføres. Fragmenterte formuleringer, personopplysninger, ulovlige duellråd og uverifiserte sitater beholdes i privat originalarkiv, ikke som spillerinstruks. Utvidet historikk, legende-/arbeidsmaur-/regissørstoff, skade- og karrierefortellinger og øvrige råblokker krever neste faglige gjennomgang. Ingen motorregler, hovedkapitler, øvelses-ID-er eller illustrasjoner endret. Full CI gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| exercise_constraints | onenote_cone_gate | Fotballnotater (Den 16.05.2026).one, råuttrekk 0x0000573c og 0x00005834 |
| coaching_transfer | onenote_ball_path | Fotballnotater (Den 16.05.2026).one, råuttrekk 0x00004b2c og 0x0000573c |
| exercise_constraints | onenote_waiting_groups | Fotballnotater (Den 16.05.2026).one, råuttrekk 0x00005ae4, 0x00005bac og 0x000daf3c |
| coaching_transfer | onenote_free_play | Fotballnotater (Den 16.05.2026).one, råuttrekk 0x000f9a40, 0x000fa3a8 og 0x00102580 |
| individual_development | onenote_motivation_conversation | Fotballnotater (Den 16.05.2026).one, råuttrekk 0x000f9c80–0x000fa780 og 0x001022f4 |
| gegenpress | onenote_selective_press | Fotballteori (Den 12.06.2026).one, råuttrekk 0x00067614, 0x00073bd4 og 0x000751cc |
| positional_play | onenote_structure_break | Fotballteori (Den 12.06.2026).one, råuttrekk 0x00067d24, 0x000683fc, 0x000754d4 og 0x00075c94 |
| collective_training | onenote_shared_perception | Fotballteori (Den 12.06.2026).one, råuttrekk 0x00037ec4 |
| training_problem | onenote_data_analysis | Fotballteori (Den 12.06.2026).one, råuttrekk 0x00035824 og 0x00035f9c |
| positional_play | onenote_rhythm_space | Fotballteori (Den 12.06.2026).one, råuttrekk 0x00032d94 |

## Bolk 24 – OneNote: Regissørene, arbeidsmaurene, beskytterne og allrounderne

11 fagavsnitt i eksisterende rolle- og treningskapitler. Råuttrekket fra Fotballteori er åpnet på nytt ved byteankerne 0x002892f4–0x00299df4, 0x002c00da–0x002c080c, 0x007e71f4–0x007e94ac og 0x007f263c. Kategoriene og de konkrete gjenfunne formuleringene er bevart som redaksjonelle sammenfatninger, mens fragmenterte overskrifter ikke fremstilles som fullstendige portretter. Eksterne holdepunkter fra UEFA, FIFA og klubbenes egne arkiver er uttrykkelig skilt fra råteksten og nye observasjonsoppgaver. Aggressive karakteristikker og uverifiserte anekdoter gjengis ikke som instruksjoner eller fakta. Tidligere PDF- og fagtillegg om Makélélé, Keane, Deschamps, Modrić, Di Stéfano, Beckenbauer og Matthäus beholdes. Ingen nye kapitler, øvelses-ID-er, figurer eller motorregler. Full OneNote-sideeksport, resterende temagrupper og CI gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| six_regista | onenote_directors | 0x00292e2c–0x00294fec, 0x007e71f4–0x007e7d5c; UEFA, https://www.uefa.com/news/025f-0fd804989c24-45d85162032d-1000--great-playmaker-displays/ |
| six_regista | onenote_pirlo_architect | 0x00292fa4–0x002937b4, 0x007e747c; UEFA, https://www.uefa.com/uefachampionsleague/news/024b-0e9939ae84c1-34d29b70c069-1000--champions-league-100-club-andrea-pirlo/ |
| eight_press | onenote_xavi_modric | 0x00293ae4, 0x0029446c–0x00294fec, 0x007e79c4; UEFA, https://www.uefa.com/news-media/news/01d6-0f85ae208ec7-b014ffa38f92-1000--xavi-reveals-passing-perfection/ |
| six_regista | onenote_workers_protectors | 0x0029537a–0x00299df4, 0x007e82cc–0x007e8c6c, 0x002c00da–0x002c0184 |
| six_regista | onenote_gattuso_pirlo | 0x002969e4, 0x007e86cc, 0x00292fa4–0x002937b4; UEFA, https://www.uefa.com/uefaeuropaleague/news/023f-0e980c697c63-7e3fcc259953-1000--why-milan-chose-gattuso-as-their-new-coach/ |
| centre_backs | onenote_desailly_rijkaard_mascherano | 0x00297774–0x00297fac, 0x0028a3fc, 0x007e8a7c; AC Milan, https://www.acmilan.com/en/club/legends/players/rijkaard ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/argentina-players-record-appearances-games |
| eight_press | onenote_cambiasso_vieira_redondo | 0x002973cc, 0x00297bcc, 0x002990cc–0x00299614, 0x007e8a7c; Inter, https://www.inter.it/en/news/esteban-cambiasso-birthday-2025 |
| six_regista | onenote_van_bommel_jeremies | 0x002892f4–0x00289b9c, 0x00298924–0x00298c7c |
| eight_press | onenote_essien_bridge | 0x0028d2cc–0x0028d76c, 0x007f263c; Chelsea, https://www.chelseafc.com/en/news/article/from-the-archive-the-smile-on-michael-essiens-face |
| fullbacks | onenote_zambrotta_luis_enrique | 0x0028da6c, 0x0028e144, 0x007f263c; FC Barcelona, https://www.fcbarcelona.com/en/football/barca-legends/players/1082626/zambrotta ; https://www.fcbarcelona.com/en/news/648051/luis-enrique-martinez/amp |
| individual_development | onenote_duncan_edwards | 0x00298374, 0x007e8c6c; Manchester United, https://www.manutd.com/en/news/a-new-way-to-celebrate-duncan-edwards ; https://www.manutd.com/en/club/history/munich-remembered/the-darkest-day |

## Bolk 25 – OneNote: pop- og kultikonene og avbrutte karrierer

9 nye kildeankrede fagavsnitt. Råuttrekket fra originalarkivet er åpnet på nytt ved 0x001a425c–0x001acd94 og 0x00280308–0x00288a34. Manusets egne temagrupper beholdes, med dokumenterte eksterne holdepunkter der angitt. Historiske prestasjoner, karriereforløp og redaksjonelle fortolkninger skilles; uverifiserte kommersielle motiver, medisinske årsaksforklaringer, spekulasjoner om privatliv og kriminalitetsmerkelapper publiseres ikke som fakta. Råstoffet er bevart i originalarkivet. Tidligere personcase om Ronaldo, Zlatan, Okocha, Neymar, Tom Lund, Strandli og Leonhardsen beholdes; øvrige korte overskrifter og kontrastcase (Gary Speed, Abel Balbo, Robin Friday, Cantona m.fl.) er ikke fullstendig dekket. Ingen nye hovedkapitler, motorregler eller illustrasjoner. Full OneNote-eksport og CI gjenstår.

| Kapittel | Underavsnitt | Kildeanker |
|---|---|---|
| wingers | onenote_waddle_pop | 0x00280d8c–0x00281454; Tottenham, https://www.tottenhamhotspur.com/news/1010025/five-stars-who-shone-for-tottenham-and-the-toon |
| wingers | onenote_beckham_deep_cross | 0x002818ac–0x00281f44 |
| wingers | onenote_best_icon | 0x00282f94–0x002836ec; IFA, https://www.irishfa.com/news/2025/november/george-best-s-iconic-moments ; Manchester United, https://www.manutd.com/en/news/seven-and-a-half-notable-games-from-career-of-man-utd-legend-george-best |
| collective_training | onenote_pop_icons | 0x00280308–0x00284cdc |
| individual_development | onenote_peak_narratives | 0x001a425c–0x001acd94 |
| load_recovery | onenote_injury_interruptions | 0x001a4e04–0x001a510c, 0x001a808c–0x001a8f8c, 0x001aaa3c–0x001aae24; Tottenham, https://www.tottenhamhotspur.com/news/989049/spurs-vs-newcastle-boot-in-both-camps-paul-gascoigne ; BBC, https://www.bbc.co.uk/sport/football/54816131 ; UEFA, https://www.uefa.com/uefaeuropaleague/news/0219-0e8c152c8589-8809a1eacaaf-1000--fiorentina-lose-rossi-to-another-knee-injury/ ; FIFA, https://inside.fifa.com/news/five-captains-in-the-spotlight |
| finishing_press | onenote_owen_torres | 0x001aa274–0x001aa554, 0x001ab2b4–0x001ab644; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1998france/news/world-cup-at-home-argentina-england-1998-3070883 ; UEFA, https://www.uefa.com/uefaeuro/history/news/0253-0d7c89c87906-4e5d5cebef3e-1000--spain-deliver-on-promise-at-last/ |
| ten_creator | onenote_savicevic_kaka | 0x001a425c–0x001a45cc, 0x001abaec–0x001abefc; UEFA, https://www.uefa.com/uefachampionsleague/news/021f-0e8f9a357f7e-80893333dd43-1000--legendary-moments-savicevic-on-1994-lob/ ; https://www.uefa.com/news/0250-0c50f2621e37-47ba14abda3a-1000--kaka-inspires-milan-to-world-title/ |
| finishing_press | onenote_rossi_shevchenko_adriano | 0x001a48f4, 0x001a9b94, 0x001ac3f4–0x001ac51c; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1982spain/news/world-football-pays-tribute-to-pablito ; UEFA, https://www.uefa.com/news-media/news/01a4-0e108f265ffc-7d37e0988b22-1000--shevchenko-takes-ballon-d-or/ ; Inter, https://www.inter.it/en/archivio_giocatore/G0726 |
