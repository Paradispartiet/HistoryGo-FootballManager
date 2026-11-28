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
- Fysiologi, mental trening, pedagogikk, kritikk av tidlig spesialisering og sosial tilgang.
- Fotballhistorie, kultur, spiller- og trenereksempler; historiske påstander og sitater kildekontrolleres før publisering.
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
