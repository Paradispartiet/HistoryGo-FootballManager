# Produktprinsipp: klubbdrift som læringssimulering

Dette dokumentet er en **overordnet produktkontrakt** for HG Football Manager. Ved konflikt med eldre funksjonsdokumentasjon skal denne retningen legges til grunn for videre produktutvikling.

## 1. Hva HG Football Manager er

HG Football Manager er ikke først og fremst en kopi av Football Manager og heller ikke primært et økonomi- eller optimaliseringsspill.

Produktet skal være en **simulering av fotballklubbens arbeidshverdag** der brukeren får innblikk i hvordan en klubb faktisk fungerer og lærer fotball gjennom å utforske, forstå og utføre oppgaver som finnes i virkelig klubbdrift.

Sesong, kamper, tabell, laguttak og andre spillmekanikker gir struktur og konsekvenser, men de er et middel for læring og simulering — ikke selve formålet.

Hovedspørsmålet for nye funksjoner er derfor:

> Hjelper dette brukeren å forstå hvordan fotball, en fotballklubb eller en konkret fotballfaglig arbeidsprosess faktisk fungerer?

Hvis svaret bare er «Football Manager har dette», er det ikke tilstrekkelig grunn til å bygge funksjonen.

## 2. History Go eier spilleroppdagelsen

Spillere samles gjennom History Go når brukeren besøker relevante steder og lærer om fotballhistorien der.

Den grunnleggende kjeden er:

```text
Besøk et sted i History Go
→ lær om stedet, klubben og/eller spilleren
→ lås opp spilleren
→ spilleren blir tilgjengelig i HG Football Manager
→ lær å bruke spilleren i lag, rolle, taktikk og kamp
```

HG Football Manager skal ikke bygge et parallelt spilleranskaffelsessystem som konkurrerer med denne kjernen.

Det betyr blant annet:

- History Go er autoritativ kilde til hvilke historiske spillere brukeren har oppdaget/låst opp.
- En ukjent spiller skal ikke dukke opp som tilfeldig kjøpsobjekt bare fordi et tradisjonelt overgangsmarked trenger innhold.
- Managerdelen skal først og fremst lære brukeren **hva spilleren er, hvordan han spilte og hvordan han kan brukes**, ikke hva han «koster».
- En spiller som er samlet i History Go skal fortsatt være en del av samlingen selv om managerens aktive lag eller tropp endres.

## 3. Ikke dikt alder, karrieretidspunkt, kontrakter eller markedsverdi

Spillermaterialet kan bestå av historiske spillere fra forskjellige perioder. Mange profiler har ikke nødvendigvis en canonical alder eller ett definert karrieretidspunkt i managersaven.

Derfor skal vi ikke automatisk påføre spillerne moderne klubbøkonomisk simulering som om de eksisterte i én felles virkelig samtid.

Som hovedregel skal systemet ikke finne på:

- alder når alder ikke er definert i canonical data;
- kontraktslengde;
- kontraktsutløp;
- lønn;
- markedsverdi;
- overgangssum;
- agentkrav;
- økonomisk verdi basert på Overall, `classHeight` eller andre skjulte styrketall.

Dersom slike opplysninger senere brukes, må de enten være dokumenterte faktiske data med tydelig historisk kontekst, eller være eksplisitt begrunnede simuleringsdata som lærer brukeren noe reelt. De skal ikke innføres bare for å skape et vanlig managerspill-loop.

## 4. Klubbrom skal representere faktisk arbeid

Klubbens områder skal forstås som faglige og operative miljøer brukeren kan gå inn i og lære av.

De skal ikke primært være oppgraderingsknapper, nivåstiger eller passive prosentbonuser.

### Treningsanlegget

Treningsanlegget skal lære hvordan en fotballklubbs treningsmiljø er bygget opp og brukes.

Det kan omfatte:

- hvilke treningsbaner og underlag klubben faktisk har til disposisjon;
- garderober, styrkerom, innendørsflater, analyseområder og andre relevante rom;
- hvilket utstyr klubben disponerer;
- materialforvalterens rolle og utstyrsansvar;
- baller, vester, kjegler, småmål, mannequiner, GPS-utstyr og annet treningsmateriell;
- hvordan en treningsøvelse settes opp fysisk;
- antall spillere, banestørrelse, varighet, regler og coachingpunkter;
- hvordan øvelser kobles til et fotballfaglig mål;
- hvordan en treningsuke og belastning planlegges;
- hvordan klubb, trenertradisjon, klima, baneforhold og tilgjengelige fasiliteter påvirker treningsarbeidet.

Brukeren skal over tid kunne **utforske og utføre** deler av dette arbeidet, ikke bare lese om det.

Eksempel: Hvis brukeren setter opp en possession-øvelse, bør spillet kunne forklare hvordan areal, overtall, touchbegrensning, retning og antall spillere endrer øvelsens hensikt og belastning.

### Det medisinske apparatet

Det medisinske apparatet skal lære hvordan skader vurderes, behandles og forebygges i fotball.

Det kan omfatte:

- klubblegens rolle;
- fysioterapeutens rolle;
- fysisk trener og rehabiliteringsarbeid;
- akutt vurdering etter skade;
- observasjon av symptomer og skademekanismer;
- hvordan ulike typer skader identifiseres og undersøkes;
- når videre medisinsk undersøkelse er nødvendig;
- rehabiliteringsfaser;
- belastningsstyring;
- skadeforebyggende trening;
- kriterier for retur til trening;
- kriterier for retur til kamp;
- forskjellen mellom symptomfri, treningsklar og kampklar.

Medisinsk avdeling skal derfor ikke reduseres til «nivå 2 = lavere skadeprosent». Skadeutfall kan fortsatt påvirkes av faktiske valg i trening, belastning, restitusjon og behandling, men effekten skal være forståelig gjennom den simulerte arbeidsprosessen.

### Stab og andre klubbfunksjoner

Samme prinsipp gjelder resten av klubben. En rolle eller avdeling skal først og fremst gi innblikk i hva den faktisk gjør.

Eksempler:

- assistenttrener: planlegging, observasjon, feedback, øvelsesledelse og kampforberedelse;
- keepertrener: keeperteknikk, posisjonering, distribusjon og spesifikke økter;
- materialforvalter: utstyr, drakter, logistikk og treningsmateriell;
- analyse: video, mønstre, motstander, egne prinsipper og kampdata;
- sportslig ledelse: troppsplanlegging og organisatoriske beslutninger der disse faktisk er relevante.

## 5. Klubber skal være forskjellige på virkelige og faglige måter

Klubber bør ikke først og fremst skilles gjennom abstrakte tall som «Training Facility 87» mot «Training Facility 64».

Forskjeller bør så langt datagrunnlaget tillater det komme fra faktisk eller eksplisitt modellert klubbkontekst, for eksempel:

- hvilke fasiliteter klubben disponerer;
- banetype og treningsforhold;
- klima og geografi;
- tilgjengelig utstyr;
- størrelsen og sammensetningen av støtteapparatet;
- akademi- og rekrutteringsstruktur;
- treningsfilosofi og trenertradisjon;
- hvordan treningsuken organiseres;
- logistiske og praktiske rammer.

Når vi beskriver en navngitt virkelig klubb, skal faktapåstander kunne kildebelegges. Der vi ikke har dokumentasjon, skal vi ikke late som en generisk simulering er en faktisk klubbpraksis.

## 6. Økonomi er ikke et obligatorisk kjernesystem

HG Football Manager trenger ikke økonomi bare fordi tradisjonelle managerspill har økonomi.

Økonomiske funksjoner skal bare beholdes eller bygges dersom de gir reell innsikt i klubbdrift og modellen kan forsvares faglig og datamessig.

Det betyr:

- ingen obligatorisk fiktiv klubbvaluta som hovedprogresjon;
- ingen kunstig lønnsramme bare for å begrense historiske spillere;
- ingen oppdiktede kontrakter på spillere uten en definert tidskontekst;
- ingen kjøp/salg-loop som undergraver History Go-samlingen;
- ingen fasilitetsøkonomi der læringsinnholdet erstattes av «kjøp neste nivå».

Dersom økonomi senere inngår, bør den brukes til å forklare **hvordan klubbøkonomi faktisk fungerer**: inntektskilder, kostnader, budsjettering, lønn, reise, anlegg, kampdag, sponsorater, lisenskrav eller andre reelle prosesser — med tydelig skille mellom dokumenterte fakta og simuleringsforenklinger.

## 7. Spillet skal lære gjennom handling

Læringsinnholdet skal ikke ende som en separat tekstbank ved siden av spillet.

Den beste formen er:

```text
situasjon
→ brukerens valg eller handling
→ simulert konsekvens
→ forklaring på hvorfor
→ mulighet til å undersøke faget dypere
```

Eksempler:

- planlegg en treningsøvelse og se hva valgene trener;
- vurder en spiller med smerter i bakside lår og velg riktig videre håndtering;
- sett opp et press og se hvilke rom som åpnes;
- velg rolle og posisjon for en historisk spiller og få forklart hvorfor det passer eller ikke passer;
- analyser en kamp og knytt hendelsene til taktiske prinsipper.

Simuleringen skal dermed gi brukeren en grunn til å forstå fagstoffet.

## 8. Spillmekanikkens rolle

HG Football Manager kan fortsatt ha:

- ligaspill;
- sesonger;
- kamper;
- tabell;
- laguttak;
- taktiske valg;
- trening;
- skader og belastning;
- scenarioer;
- konkrete mål og utfordringer.

Men disse systemene skal understøtte lærings- og simuleringsmålet. Vi skal ikke fylle produktet med systemer bare for å oppnå funksjonslikhet med kommersielle managerspill.

## 9. Produktport for nye funksjoner

Før en ny managerfunksjon bygges, skal den vurderes mot disse spørsmålene:

1. Hvilken virkelig fotballprosess representerer funksjonen?
2. Hva skal brukeren lære eller forstå ved å bruke den?
3. Kan handlingene i UI knyttes til faktiske arbeidsmåter, fagbegreper eller beslutninger?
4. Bruker vi dokumenterte klubbdata når vi hevder noe om en virkelig klubb?
5. Diktar vi opp alder, penger, kontrakter, markedsverdi eller andre fakta vi egentlig ikke har?
6. Dupliserer funksjonen noe History Go allerede eier?
7. Er dette nødvendig for HG Football Manager, eller bygger vi det bare fordi Football Manager har det?

En funksjon som ikke har gode svar på disse spørsmålene skal normalt ikke bygges.

## 10. Konsekvens for eksisterende v1/v2-systemer

Følgende eksisterende leveranser er teknisk implementert, men skal **ikke brukes som produktmessig presedens** før de er vurdert mot denne kontrakten:

- `FACILITIES_UPGRADES_V1.md` — nivåbaserte fasilitetsoppgraderinger er feil hovedmodell for trening og medisin;
- `MANAGER_ECONOMY_CONTRACTS_V1.md` — fiktive spillerkontrakter, lønnsenheter og kontraktsutløp er ikke en fast produktregel;
- `MANAGER_TRANSFER_MARKET_V2.md` — et klassisk kjøp/salg-marked skal ikke konkurrere med History Go som kilden til spilleroppdagelse.

Disse systemene skal i en senere implementeringsrunde enten fjernes, forenkles eller bygges om til læringsorienterte klubbprosesser. Denne dokumentasjonsendringen alene endrer ikke runtime-koden.

## 11. Kort canonical formulering

> **History Go lar brukeren oppdage fotballen. HG Football Manager lar brukeren gå inn i klubben og forstå hvordan fotballarbeidet faktisk utføres.**

Det er denne identiteten videre produktutvikling skal beskytte.
