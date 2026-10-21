# Fotballtaktikk – faglig evidens, etterprøving og modellbegrensninger (21.10.2026)

## Formål, status og måleproblem

Denne revisjonen omfatter **18 kampplaner og alle historiske motstanderarketyper** i Football Manager. En taktisk handlingskjede er en **etterprøvbar spillhypotese**, ikke dokumentasjon for at fire handlinger fant sted i en virkelig kamp. De historiske motstanderne er rekonstruerte *stilarchetyper*, ikke posisjons-/hendelsesdata fra de aktuelle sesongene. Tilsvarende er lagets `pressScore`, `depthScore`, `widthScore`, `balanceScore`, `restDefenseScore` og `buildUpScore` sammensatte spillmetrikker, ikke GPS- eller kameraestimater.

**Evidensnivået må skilles:**

1. **Faglig støttede mekanismer:** Fotball er kollektiv, adaptiv og romlig. Bredde, dybde, avstander, posisjoner, kompakte forsvarsledd og overganger påvirkes av spillfasen, ballposisjonen og motstandernes handlinger. Systematiske oversikter støtter at slike kollektive dimensjoner bør undersøkes sammen, men de dokumenterer ikke våre 18 eksakte firetrekkssekvenser.
2. **Trenerhypoteser i modellen:** Hver sekvens, den tilordnede motstanderforutsetningen, fire handlinger og et svar på motspill er **redaksjonelt/faglig modellert**. Det er ikke en publisert forsøksprotokoll som bekrefter at akkurat kjeden har en bestemt sannsynlighet for å lykkes.
3. **Kalibreringsfrie spilldesignparametere:** Tersklene fra 0 til 100, ekstrabonus på `1 planEdge` og konverteringen `planEdge × +0,09 xG for` og `−0,06 xG imot` er konstruerte modellvekter. De er **ikke kausale koeffisienter estimert fra historiske kampdata**. Den publiserte xG-forskningen bruker reelle skudd-/hendelsesdata, holdout-tester og prediksjonsfeil. Derfor kan vi ikke hevde at våre parametere er vitenskapelig validerte ennå.

## Kilderegister – åpne, identifiserbare undersøkelser

| Kilde | Dokumentert bidrag | Hva den **ikke** gir dekning for |
| --- | --- | --- |
| Teixeira mfl. (2022), *Integrating physical and tactical factors in football using positional data: a systematic review*, [PMC9671036](https://pmc.ncbi.nlm.nih.gov/articles/PMC9671036/) | 26 studier av fysisk/taktisk samspill med posisjonsdata; behov for kontekst og flerfaktoranalyse | Våre terskler, motstanderprofiler eller xG-vekter |
| Coito mfl. (2022), *Capturing and Quantifying Tactical Behaviors in Small-Sided and Conditioned Games in Soccer*, [PMID 33030987](https://pubmed.ncbi.nlm.nih.gov/33030987/) | 31 studier av kollektive rom-, balanse-, bredde-, lengde- og avstandsvariabler | Eksakte firetrinnsmønstre for elitekamper |
| Los Arcos mfl. (2022), *Reference values for collective tactical behaviours based on positional data*, [PMC8805357](https://pmc.ncbi.nlm.nih.gov/articles/PMC8805357/) | Kampkontekst, ballplassering og fase påvirker kollektiv rombruk | Direkte overføring fra meter til de seks interne 0–100-skalaene |
| Sotudeh mfl. (2025), *The principles of tactical formation identification in association football – a survey*, [PMC11836022](https://pmc.ncbi.nlm.nih.gov/articles/PMC11836022/) | En formasjon er en mønsterbeskrivelse som må tolkes dynamisk | At 4-3-3 slår 4-4-2 eller andre universelle formasjonshierarkier |
| Biermann mfl. (2025), *Contextualization of soccer analysis with tactical periodization*, [Springer](https://link.springer.com/article/10.1007/s10618-025-01092-9) | Taktisk kontekst og spillfaser må representeres eksplisitt | Kausal xG-effekt av en kampplan i spillet |
| Afonso & Bessa (2020), *A systematic review of research on Tactical Periodization*, [journal](https://hummov.awf.wroc.pl/A-systematic-review-of-research-on-Tactical-Periodization-absence-of-empirical-data%2C122349%2C0%2C2.html) | Advarer mot å forveksle attraktiv fotballteori med empirisk dokumentert effekt | Bruk av taktisk periodisering som bevist universell metode |
| PLOS ONE (2023), *Expected goals in football: Improving model performance and demonstrating value*, [DOI 10.1371/journal.pone.0282295](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0282295) | Åpne hendelsesdata, train/test-splitt og feil-/prediksjonsmåling for xG | Kalibrering av `+1 planEdge` i vårt spill |

## Operasjonalisering, falsifisering og tester

**Hypotese H1 – kollektiv støtte:** Gitt samme kampplan og motstander skal en intakt rolle-/formasjonskjede få høyere `sequenceEdge` enn identisk oppsett med ett nødvendig lagledd under kravgrensen. **Falsifiseres hvis** uttak/rolleendring ikke påvirker evalueringen eller gir bonus uten dekning.

**Hypotese H2 – respons og usikkerhet:** Når motstanderen når en definert kapasitet til motspill, skal den ekstra fordelen forsvinne. Når motspill er **ukjent**, skal den ikke antas å være fraværende. **Falsifiseres hvis** manglende data eller motgrep gir bonus.

**Hypotese H3 – konsekvens:** Med likt lag, kampplan og motstander for øvrig skal et identifisert ekstra taktisk overtak gi tilsvarende fortegn i kampmotorens forventede sjanser, uten å gi fire uavhengige gevinster. **Falsifiseres hvis** kampens planEdge ikke leses av xG-motoren eller bonusen stables ved gjentatt evaluering.

**Hypotese H4 – generisk overlegenhet:** Ingen kampplan bør klassifiseres som empirisk best uavhengig av motstander, roller og kampfase. Dette er et **designmål**, ikke dokumentert resultat; det må undersøkes med systematisk sensitivitetsanalyse i stedet for å tvinge alle planer til samme vinnersjanse.

`npm run sim:match-plan` reproduserer deterministisk:

- Alle **18 × N** faktiske historiske motstanderarketyper (N hentes fra det publiserte registeret ved kjøring). For hver kombinasjon rapporteres hvor mange som viser trigger, motgrep, ukjent respons eller fordel.
- For hver av 18 planer: grenseverdi minus én, eksakt grense og ufullstendig/skadet metrikk; fjerning av ett enkelt obligatorisk lagledd; motgrep under/på grensen; samt helt ukjent motstander- og lagprofil.
- At analyse og kampmotor leser **samme** sekvensresultat, at de ikke muterer motstanderprofil eller lagprofil, og at gjentatt evaluering gir samme svar.
- Eksisterende tester for faktisk xG-forskjell, omstilling, press, dybde, bredde, kampklokke og rollefit.

Dette er **programvareverifikasjon og intern modellkonsistens**, ikke ekstern prediktiv validering. Suksess i syntetiske tester teller ikke som evidens for en reell, kausal effekt i profesjonell fotball.

## Videre empirisk validering før merkelappen «vitenskapelig validert»

Bruk lovlig innsamlede, tidsstemplede kamp- og tracking-/eventdata som uavhengig referanse. Merk angrepsoppbygging, pressutløsere, brudd, omstillinger, romgevinst, relasjoner og 10-sekunders videre konsekvens med en eksplisitt annotasjonsmanual. Bruk to blindede fotballfaglige kodere og rapporter enighetsmål før eventuell modelltilpasning. Del lag/kamper kronologisk i trening/validering/holdout; unngå at samme kamp finnes på begge sider. Hold `+1 planEdge`, minimumskrav og motspillsgrenser **frosset som baseline** før første holdout. Sammenlign mot en nullmodell uten sekvensbonus på log-loss/Brier og kalibreringskurver for skuddmål, der slike utfall kan observeres; mål også diskriminering av relevante spillhendelser og usikkerhet med konfidensintervaller. Rapportér planvis antall observasjoner og ikke-kalibrerbare planer som «ikke estimert», ikke som null effekt.

**Per 21.10.2026 finnes ikke en slik ekstern datavalidering i repositoryet.** Dette dokumentet er et tydelig kontrollgrunnlag for den neste forskningsfasen, ikke en påstand om at den allerede er gjennomført.

## Kampmotor v6 – etterprøvbar overgang ved brutt oppbygging

**Implementert spillmodell, ikke empirisk validert overgangsmodell.** Når v6 først løser et mislykket oppbyggingsforsøk mot høyt press, kan en ny kamp øve på den **samme** følgende handlingskjeden, i stedet for å legge en løs kontringsbonus på laget:

1. Motstanderen gjenvinner ballen i vår oppbygging.
2. Første vertikale pasning prøver å passere vårt første gjenvinningspress og pasningsdekning.
3. Hvis pasningen stanses, er ballen gjenvunnet: overgangen skaper **ingen egen sjanse imot**.
4. Hvis pasningen lykkes, avgjør eksisterende restforsvar, balanse og faktisk rollepassform hos stopper/midtbane om kontringen blir forsinket.
5. Hvis også dette leddet brytes, oppstår et kontringsvindu med en samlet moderat xG-risiko.

Hvert scenario har **ett** terminalt utfall: `regained` (0.00 ekstra xG imot), `contained` (0.02) eller `counterattack` (0.14). Dette **erstatter** det foreløpige tapets xG-risiko på 0.04/0.08/0.12 fra oppbyggingsmodellen; disse skal aldri adderes. Motstanderens øvrige ordinære sjanser i samme kampperiode følger fremdeles basis-xG. Tallene er dokumenterte **modellkonstanter**, ikke estimerte faktiske overgangssannsynligheter.

Overgangen krever faktiske, tilgjengelige lagmetrikker (press, balanse og restforsvar), dokumentert rollepassform for stopper og midtbanestøtte samt kjent motstander-`transitionThreat`. Ved manglende data oppstår ingen fiktiv ferdighet eller ny overgangsbonus: den tidligere v6-tapsmodellen beholdes. Bare nye matchsaves (`causalTransitionsVersion: 1`) får utvidelsen. Gjenspilling av samme kamp og periode får identiske taktiske situasjonsutfall, også etter innbytte, mens kvaliteten på lagets faktiske roller påvirker sannsynligheten for å lykkes. Mål og sjanser genereres fremdeles én gang, **etter** at overgangsutfallet er avgjort.

`npm run sim:turnovers-v6` etterprøver de tre terminalutfallene, den kausale rekkefølgen, svakere og sterkere rolledekning, usikkerhetsfallback, samme kamp/periode ved gjenspilling, slutt-xG og fravær av doble sjanser. Hypotesene bør senere prøves mot annoterte kamphendelser med samme holdout-/kalibreringskrav som beskrevet ovenfor.

## Kampmotor v6 – angrepskjeder mot kompakt lav blokk

Den neste avgrensede situasjonen starter **før** sjansegenerering, når motstanderens observerbare spillmodell viser både defensiv kompakthet (minst 72 av 100) og lav linje (høyst 55). Dette er valgte spillterskler, ikke empirisk estimerte grenser. Navngitte, redaksjonelt modellerte `low_block_opponent`-arketyper har dokumenterte standardverdier, mens ukjente motstandere **ikke** tildeles kompakt blokk ved antakelse.

Åtte eksisterende planer benytter fire forskjellige handlingskjeder:

- `positional_overloads`, `wide_fast_433` og `overlap_channels`: støttepasning → breddeisolasjon → overlapp → vending til rom.
- `crossing_box_presence`: back-/kantovertall → innleggsrom → spissens boksløp → retursikring.
- `target_man_focus` og `central_possession_4231`: første pasning → oppspill på spiss → avlegg → tredjemann.
- `chase_the_equaliser` og `all_out_attack`: høyt støtteledd → kantgjennombrudd → boksløp → utsatt returrom.

Hver kjede krever at **forskjellige faktisk valgte spillere** dekker samtlige rolleledd med kjent `matchFitKnown` og et numerisk `matchScore`, samt dokumenterte eksisterende lagmetrikker, restforsvar og motstanderens overgangstrussel. Oppgitt kollektiv `wideCover`, `boxCover` eller `centralCover` er et konkret motgrep som senker sannsynligheten; ukjent motgrep behandles som *ukjent*, ikke som bekreftet åpning. Dårlig utført angrep og utilstrekkelig restforsvar kan skape én **moderert ekstra kontringsrisiko**, men en avvist angrepskjede med godt restforsvar skaper ikke automatisk sjanse imot.

Angrepskjeden med høyt press har prioritet hvis motstanderens profil oppfyller begge scenarioer. Bare **én** v6-fase får påvirke xG i en gitt kampperiode. Eldre lagringer uten `causalCompactBlockVersion: 1` forblir uendret. Den opprinnelige statiske planmatchupen trekkes ut for perioder der v6 eier en situasjon: samme fordel skal ikke betales to ganger. Det opprettes ingen ekstra mål eller skudd utenom kampklokkens ordinære sjanser.

`npm run sim:compact-block-v6` verifiserer alle åtte planer, faktisk rollekjede, svakere spillere med samme formasjon, eksplisitt kollektiv motdekning, avvist angrep og variasjon i restforsvar, ukjente data, deterministisk gjenspilling, at konkurrerende v6-situasjoner ikke dobbeltkjøres, og at periodevis xG stemmer med kampresultatet. Modellkonstantene (henholdsvis 0.09, 0.10 eller 0.12 ekstra xG for vellykket angrepskjede) er **kalibreringsfrie designparametere**. Ingen historisk spiller, kamp eller optisk sporingsdata er presentert som bekreftelse på dem.

## Kampmotor v6 – kollektivt press og motstanderens utvei (ny arbeidsdel)

Den samme kausale kampmotoren kan simulere **vårt forsvar mot motstanderens oppbygging** før skuddsjansene avgjøres. Tre planer har hver sin fireleddsmodell:

- **`high_press_343`** mot dokumentert kort oppbygging: spiss styrer første pasning, kant/vingback presser, sentral midtbane skjermer retur og stopper sikrer bakrom.
- **`midfield_press_trap`** mot dokumentert ballkontroll: invitere pasningen sentralt, skjerme mottaker, kollektiv utløser på neste pasning og bakre sikring.
- **`counter_press_recovery`** mot kjent overgangstrussel: balltap som simulert utgangspunkt, umiddelbart førstetrykk, stenge første fremoverpasning og sikre andreball. Dette er en egen modellert angrepsfase, ikke en påstand om at en kampvideo bekrefter en bestemt balltapshendelse.

Sannsynligheten for gjenvinning er knyttet til navngitte, faktisk valgte lagledd med kjent rollepassform, press-/balanse-/restforsvarsmetrikker, relevant motstanderprofil og dens **dokumenterte pressresistens**. Et eksplisitt kartlagt motgrep (`pressEscapeRoute`: `third_man`, `switch_play` eller `direct`) kan svekke pressfellen. Ukjent motgrep gir ingen ubegrunnet motstanderbonus. Hvis presset brytes, må restforsvaret forsøke å stoppe neste rom **før** et kontringsvindu kan bli til.

Terminalt utfall er **`regain`**, **`contained`** eller **`escaped`**. Bare terminalutfallet justerer periodens xG, én gang: ved gjenvinning moderat økt offensiv mulighet (0.08–0.11), ved innehentet press gjennombrudd liten fare (0.02 imot), ved åpent bakrom større fare (0.06–0.12 imot) avhengig av dokumentert restforsvar. Gjenvinning reduserer også motstanderens perioderisiko marginalt (−0.01). Alle tall er **spilldesign**, ikke publiserte empiriske effektstørrelser.

Fasen er eksklusiv mot de to foregående v6-angrepsfasene i én periode og aktiveres bare for nyopprettede kamper med `causalPressingVersion: 1`. Ingen mål eller sjanser kan tilskrives et ikke-generert skudd. Forsvarlig test: `npm run sim:own-press-v6` verifiserer tre planer, kollektiv rollekjede, motstanders evne til pressgjennombrudd, eksplisitt motspill, tre utfall, restforsvar, gammelt save, deterministisk gjenspilling og samsvar mellom kampresultat og xG-regnskap.

Dette er fortsatt intern spillmodellverifikasjon. Full kalibrering og virkelighetsnær påstandsverifisering krever uavhengige, annoterte kamp-/trackingdata slik dokumentet spesifiserer.

## Kampmotor v6 – fire siste hovedplaner og 18/18 planveier

Etter tidligere leveranser har 14 av de 18 kanoniske kampplanene minst én v6-handlingskjede. Denne utviklingsdelen gir de fire gjenstående planene egne kausale kampfaser:

| Plan | Trigger hos motstander | Fire avhengige handlinger | Dokumenterbart motgrep | Terminallogikk |
| --- | --- | --- | --- | --- |
| `low_block_transition_541` | ballkontroll `possessionControl ≥ 67` | kompakt stopperledd → sentral midtbanedekning → gjenvinning og første spisspasning → vingback som kontringsstøtte | kollektivt restforsvar som fjerner ledig avlastning | kontringsvindu eller fortsatt motstandertrykk |
| `deep_block_long_release` | motstanderens linje `highLine ≥ 64` | første boksduell → sikring av andreball → langt oppspill til spiss → avlegg til midtbane | kollektiv andreballdekning | fremoverspill eller returpress |
| `see_out_the_game` | vi leder *og* motstanderens `pressIntensity ≥ 70` | tett stopperledd → sentral retursikring → backdekning → avlastning foran | kollektivt, koordinert press | redusert fare eller tap av kontroll |
| `slow_it_down` | motstanderens `pressIntensity ≥ 68` | keeper trekker press → stopperstøtte → sekser som trygg retur → nytt støttepunkt med ballkontroll | eksplisitt sentral pasningsdekning | redusert fare eller pressgjennombrudd imot |

Alle ledd krever *forskjellige*, navngitte spillere fra den faktiske elleveren, med kjent rollepassform, samt nødvendige teammetrikker og relevant motstanderdata. Ukjent press, forsvarslinje, rollefit eller overgangstrussel utløser ikke en antatt svakhet. `see_out_the_game` har et ekstra krav: stillingen må vise ledelse. Ved uavgjort eller underlege kamper gir denne planen ikke en urimelig tids-/ledelsesbonus.

Et kontrollert kampbilde kan **hindre** xG imot uten å generere en egen sjanse (og skal ikke krediteres et eksisterende tilfeldig skudd i minuttloggen). En støttet direkte utløsning kan skape et moderat sjansevindu; en mislykket kjede kan utsette laget for et samlet kontrings-/returtrykk. Dette er **ett** perioderesultat og **ett** samlet tillegg, ikke en bonus for hvert trekk. Mulige mål og avslutninger kommer fortsatt bare fra eksisterende xG- og sjansegenerator etter den taktiske avgjørelsen.

Den nye `causalGameControlVersion: 1` aktiveres kun ved oppstart av nye kamper. Tidligere lagringer videreføres med opprinnelig kampregnskap. `npm run sim:game-control-v6` tester alle fire planer, ledelseskravet, ukjent data, viktige roller, eksplisitte motgrep, god/dårlig dekning, deterministisk gjenspilling, xG-delta etter avrunding og fravær av fiktive sjanser.

**Dekning versus dokumentasjon:** Når denne PR-en er godkjent er alle 18 kanoniske kampplaner dekket av minst én modellert v6-kjede *under riktige spillforutsetninger*. Det er ikke det samme som at alle mulige formasjoner, motstandere, spillerroller, hendelsessekvenser og historiske kamper er empirisk kalibrert. De eksisterende terskelverdiene og konstruerte xG-vektningene er fremdeles transparente og falsifiserbare **spilldesignhypoteser**.
