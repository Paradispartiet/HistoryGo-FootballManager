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
- Keeperens detaljerte teknikk og dødballorganisering.
- Spillmodell: posisjonelle krav, klareringsmønster, opp–tilbake–gjennom, kontringsmønstre, signaler og konkrete øvelser.
- Droppunkt: Fotballnotater råtekst ved byte 0x000f2da4; kontekst og koordinatsystem må avklares før bruk.
- Kampforberedelser, kommunikasjon og komplett analysemetode.
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
