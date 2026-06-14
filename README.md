# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig managerprototype koblet til History Go / Civication. Prosjektet bygger på ett fast prinsipp:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Dette er ikke et vanlig ratingspill. `overall` beskriver klasse, ikke automatisk kampverdi. En spiller med lavere `overall` kan prestere bedre enn en høyere rated spiller dersom han brukes i riktigere posisjon, rolle, taktikk og relasjonelt mønster.

## Nåværende hovedstatus

Appen har nå flere lag som faktisk finnes i repoet:

1. **Managerkontor / startellever** – velg formasjon, taktikk, spillere og roller på banen.
2. **Individuell fitmotor** – vurderer posisjon, rolle, taktikk og feilbruk for hver spiller.
3. **Lagfitmotor** – vurderer helheten: balanse, bredde, dybde, oppbygging, press, restforsvar, relasjoner, badges og duplikatspillere.
4. **Relasjonsmotor** – vurderer om rollene hjelper eller blokkerer hverandre.
5. **History Go-unlocks** – spillere, stab, ekspertise, treningsprogrammer og badges kan knyttes til besøkte/samlede steder.
6. **Lokal starttropp** – valgfri startmodus der manageren kan begynne med de 15 nærmeste kvalifiserte spillerne uten å markere stedene som samlet i History Go.
7. **Offentlig startanker** – brukeren kan velge et offentlig History Go-/fotballsted som trygg startposisjon uten privat adresse.
8. **Startvalg for managerkarrieren** – History Go-samling, lokal start eller valgt offentlig startsted.
9. **Innboks / klubbuke** – trådbasert innboks, svarvalg og klubbverdier.
10. **Kampdag v0.2** – enkel kampdagsløkke med motstanderprofiler, managergrep, kamprapport og konsekvenser.
11. **Mini-season v0.1** – femkampers prøveperiode med styremål og sluttvurdering.
12. **Ukentlig treningsfokus v0.2** – manageren velger taktisk fokus før kamp; fokuset kan påvirke kampdag og sluttrapport.
13. **Stab, ekspertise og trening** – staff og ekspertise åpner treningsprogrammer og badgeprogresjon.
14. **Lagidentitet** – lagklasser basert på opptjente badges og utviklingsretning.
15. **Stedsrapporter** – forklarer hva sportsteder gir manageren.
16. **Historisk formasjonsbibliotek** – egen `data/hgFootball/`-modul med historiske epoker, formasjoner, rolletyper og unlock-regler.
17. **Formation Knowledge Engine** – formasjonskunnskap, matchup-logikk, risikoer, justeringsforslag og treningskoblinger.

Dette er fortsatt ikke et ferdig spill. Full liga, tabell, sesongdybde, rikere UI, full treningsprogram-komposisjon, full off-pitch-simulering og dyp dokumentasjon for alle formasjoner gjenstår.

## Viktige filer

```txt
index.html
style.css
README.md
CLAUDE.md

src/
  app.js
  app-manager-engine-bridge.js
  football-fit-engine.js
  football-team-fit-engine.js
  football-relationship-engine.js
  football-badge-effect-engine.js
  football-matchday-engine.js
  football-match-consequences.js
  football-mini-season.js
  football-training-week.js
  hg-formation-library.js
  engine/evaluateFormationMatchup.ts

data/
  football_players.json
  football_player_archetypes.json
  football_roles.json
  football_tactics.json
  football_formations.json
  football_knowledge_principles.json
  football_unlocks.json
  football_place_locations.json
  football_staff.json
  football_expertise.json
  football_training_programs.json
  football_training_badges.json
  football_team_classifications.json
  football_place_reports.json
  football_team_merits.example.json
  club_inbox_threads.json
  club_inbox_senders.json
  club_inbox_messages/
  club_inbox_choices/
  hgFootball/
    formationKnowledge.json

docs/
  local-start-squad.md
  hgFootball/formations/

scripts/
  audit-hg-football-data.mjs
  audit-hg-formation-knowledge.mjs
  simulate-matchday-v02.mjs
  simulate-mini-season.mjs
  simulate-training-week.mjs
  simulate-formation-matchup.mjs
```

## Kjøring

Prosjektet er foreløpig en statisk HTML/CSS/JS-app uten framework.

Direkte åpning av `index.html` kan feile fordi JSON-data lastes med `fetch`. Bruk GitHub Pages eller en enkel lokal server:

```bash
python3 -m http.server 8000
```

Åpne deretter:

```txt
http://localhost:8000
```

Viktige sjekker:

```bash
npm run typecheck
npm run build
npm run audit:knowledge
npm run audit:hg-football
npm run audit:hg-historical-fit
npm run audit:hg-coach-context
npm run audit:hg-formation-knowledge
npm run sim:matchday
npm run sim:mini-season
npm run sim:training-week
npm run sim:formation-matchup
```

## Designprinsipper

### 1. Ingen dårlige spillere

Spilleren skal ikke samle seg opp fra svake spillere til sterke spillere. Alle funn er klassespillere. Forskjellen ligger i type, rolle, behov og systempassform.

### 2. Rating er sekundært

`overall` skal aldri alene avgjøre resultatet. Rollefit, taktikkfit, posisjonsfit, relasjoner, lagbalanse og feilbruk skal veie tyngre.

### 3. Trenerfeil skal forklares

Hvis en dribler brukes som møtende spiss, skal systemet forklare at spilleren mister bredde, 1v1-situasjoner og rom til å utfordre. Det betyr ikke at spilleren er dårlig. Det betyr at treneren bruker ham feil.

### 4. Relasjoner er en del av taktikken

Laget skal vurderes på om rollene støtter hverandre:

- bred dribler + overlappende back / vingback
- møtende spiss / falsk nier + løp rundt seg
- dyp playmaker / regista + bakromsløper
- targetspiss + innleggskilde
- ballspillende stopper / libero + dyp playmaker
- sweeperkeeper + ballspillende forsvar
- presspiss + pressende midtbane
- fri offensiv skaper + sluttprodukt foran seg

Negative relasjoner skal også forklares:

- kant uten støtte i bred taktikk
- møtende spiss uten løp
- targetspiss uten service
- playmaker uten beskyttelse
- flere frie skapere i samme rom
- begge back-/vingback-sider høyt uten sikring
- presspiss uten ettertrykk
- linjekeeper bak høy linje

## Kjernearkitektur

### Individuell fitmotor

Ligger i:

```txt
src/football-fit-engine.js
```

Den vurderer blant annet:

- `positionFit`
- `roleFit`
- `tacticFit`
- `misusePenalty`
- `matchScore`
- `status`
- forklaring og rolleforslag

### Lagfitmotor

Ligger i:

```txt
src/football-team-fit-engine.js
```

Den bygger på individuell fit og vurderer laget som helhet. Den skal ikke bare være et gjennomsnitt av enkeltspillere. Den vurderer blant annet balanse, bredde, dybde, oppbygging, press, restforsvar, relasjoner, badge-effekter og duplikatspillere.

Badge-effekter legges forsiktig oppå base-metrics. Relasjoner inngår som egen `relationshipScore` og som rapportpunkter i styrker/problemer.

### Relasjonsmotor

Ligger i:

```txt
src/football-relationship-engine.js
```

Motoren vurderer om rollene i elleveren hjelper eller blokkerer hverandre. Den endrer ikke spillernes grunnkvalitet. Den vurderer trenerens struktur: får spillerne riktige medspillere rundt seg, eller blir styrkene isolert?

### History Go-unlocks

Appen leser ekte History Go-progresjon fra localStorage:

```txt
visited_places
hg_groundhopper_stats_v1
```

Disse brukes til å finne besøkte/samlede sportsteder som finnes i Football Manager-unlockdata. Spillere velges ikke fritt: tilgjengelige spillere kommer fra `player_candidate`-unlocks på opplåste steder.

### Lokal starttropp og offentlig startanker

HG Football Manager støtter et valgfritt startvalg der brukeren kan begynne med de 15 kvalifiserte fotballspillerne som er geografisk nærmest nåværende lokasjon eller valgt offentlig startsted.

Dette er en startsnarvei, ikke en erstatning for History Go-samlingen. Spillere fra lokal start skal kunne brukes i managerdelen og telle mot 15-spillerkravet, men stedene deres skal ikke automatisk markeres som samlet eller besøkt i History Go.

Prinsippet er:

```txt
local_start = spillbar starttropp
publicStartAnchor = trygg offentlig startposisjon
visited_place = ekte History Go-samling
```

Lokal start og offentlig startanker skal aldri skrive til `visited_places` eller `hg_groundhopper_stats_v1`, og skal aldri lagre privat adresse.

### Stab, ekspertise, trening og badges

Stab og ekspertise låses opp via steder og unlock-regler. Treningsprogrammer krever relevant ekspertise og riktig type ansatt stab. Badgeprogresjon kan gi små metriske bonuser til laget, for eksempel på press, restforsvar, oppbygging eller bredde.

### Innboks og klubbuke

Innboksen er trådbasert. Meldinger kan ha svarvalg. Svarvalg kan gi små effekter på Club Week-verdier som styretillit, moral, taktisk klarhet, treningskultur og medietrykk.

### Kampdag, konsekvenser og mini-season

Kampdag v0.2 gir en enkel kampdagsløkke der manageren møter motstanderprofiler, tar valg, får rapport og får konsekvenser tilbake til Club Week / mini-season.

Mini-season v0.1 gir en lett femkampers prøveperiode med motstanderplan, styremål, poeng og sluttvurdering. Dette er en ramme for testing av kampdag og managergrep, ikke en full ligamotor.

### Historisk formasjonsbibliotek

`data/hgFootball/` er et eget historisk datagrunnlag for HG Football Manager. Det inneholder blant annet:

- historiske formasjonsepoker
- formasjonssystemer
- rolletyper
- spiller-/rolle-fit-regler
- staff-roller
- unlock-regler

`src/hg-formation-library.js` leser dette som et eget formasjonsbibliotek i appen. Formasjoner behandles som historiske taktiske systemer, ikke bare tall.

Audit:

```bash
npm run audit:hg-football
```

## HG Football Manager som læringsspill

HG Football Manager skal ikke bare være et manager-spill. Det skal være et **læringsspill om fotball** – en spillbar fotballskole om taktikk, trening, formasjoner og kontekstuell managerforståelse.

Grunnprinsippet:

> Forslagene viser hva som normalt er riktig.
> Dokumentasjonen forklarer hvorfor.
> Egne valg lar spilleren gå forbi standardløsningen når spilleren forstår konteksten bedre.

### 1. Spillets pedagogiske kjerne

Spilleren skal lære:

- hvorfor en formasjon passer eller ikke passer
- hvorfor en treningsuke bør settes sammen på en bestemt måte
- hvordan motstanderens styrker og svakheter påvirker egne valg
- hvordan taktiske parametre står mot hverandre
- hvorfor ingen taktikk er perfekt i alle situasjoner
- hvordan kontekstuelle managergrep kan slå taktisk sterkere lag

Spillet skal lære spilleren å se *hva som er riktig*, ikke bare gi et fasitsvar. Derfor finnes forslagene – og derfor finnes muligheter utover forslagene.

### 2. Forslag ved alle store valg

Alle større valg skal ha **foreslåtte setups**. Dette gjelder blant annet:

- formasjon
- kampplan
- treningsprogram
- rollevalg
- spillerutvikling
- restitusjon/skadeforebygging
- defensiv struktur
- offensiv struktur
- overgangsstrategi
- stab/fasiliteter/administrasjon når dette bygges ut

Prinsipp: spilleren skal aldri bare møte et tomt valg. Spillet skal alltid gi noen faglig logiske forslag. Spilleren kan velge et forslag, se variasjoner, eller lage egen løsning.

### 3. Treningsprogrammer som sammensatte setups

Det fullverdige treningsprogramsystemet skal bygges rundt presenterte programsammensetninger, for eksempel:

- balansert uke
- kampforberedende uke
- restitusjonsuke
- skadeforebyggende uke
- defensiv struktur
- offensiv samhandling
- press og gjenvinning
- teknisk utvikling
- individuell spissutvikling
- ungdomsutvikling
- taktisk innkjøring

Hver programsammensetning skal kunne ha **variasjoner** – f.eks. normal belastning, høy intensitet, lav belastning, kamp om tre dager, skadeforebyggende variant, ungdomsvennlig variant, variant mot sterk motstander, variant etter svak kamp, variant etter tett kampprogram. Spilleren skal også kunne lage og lagre egne programsammensetninger.

Status: ukentlig treningsfokus v0.2 finnes som et første spillbart lag. Full komposisjon av treningsprogrammer med variasjoner og egne lagrede oppsett gjenstår.

### 4. Poeng etter relevante parametre, ikke universelt riktige valg

Spillet skal **ikke** gi poeng for at et valg er «bra» isolert sett. Et valg gir uttelling når det treffer riktig kontekst – riktig mengde, riktig tidspunkt.

Eksempler:

- Restitusjon gir poeng når laget har høy slitasje, tett kampprogram eller økt skaderisiko. Restitusjon *hele tiden* gir ikke poeng, fordi laget da mister utvikling, intensitet og kampform.
- Skadeforebyggende trening gir uttelling når belastningsindikatorer tilsier risiko – overbrukt blir den passiv.
- Defensiv struktur gir uttelling før kamper mot klart sterkere lag.
- Press- og gjenvinningstrening gir uttelling når kampplanen faktisk bygger på høyt press.
- Avslutningstrening gir ekstra uttelling hvis den kobles til konkrete bommer fra forrige kamp. Trener du spissen på akkurat den avslutningstypen han bommet på sist, og han scorer på en lignende sjanse neste kamp, skal det kunne gi managerpoeng.

> HG Football Manager skal ikke belønne perfekte valg.
> Det skal belønne **relevante** valg.

Slik kobles trening til faktisk kampdata, og blir årsak–virkning i stedet for menyvalg.

### 5. Forslagene kjenner taktikken, men ikke alt utenfor banen

Det går et bevisst skille mellom **taktisk anbefalt setup** og **kontekstuell managerforståelse**.

De foreslåtte valgene skal være gode etter taktiske parametre: spillertyper, formasjon, motstander, kampplan, struktur, styrkeforhold, taktisk risiko. Men forslagene skal **ikke** vite alt, og skal ikke alltid gi maksimal uttelling. De bør ikke fullt ut fange:

- skjult slitasje
- dårlig moral
- lav selvtillit
- familie-/mediepress
- uro rundt en spiller
- dårlig relasjon mellom spillere
- usynlig formsvikt
- behov for ro, trygghet eller individuell oppfølging

Det er nettopp her spilleren kan slå et taktisk bedre lag: ved å lese situasjonen bedre enn standardsystemet.

Status: deler av taktisk forslag/relevans finnes i formasjonsmatchup og treningsfokus. Full off-pitch-/skjult-kontekstsystem gjenstår.

### 6. Taktiske fallgruver

Ingen taktikk er perfekt mot alt:

- Høyt press kan fungere mot svakt oppspill, men feile mot raske bakromsspillere.
- Høy backlinje kan gi kontroll, men åpner rom bak for direkte lag.
- Lav blokk kan beskytte mot bedre lag, men gjøre eget lag passivt mot svake lag.
- Ballbesittelse kan gi kontroll, men bli farlig mot aggressivt press.
- Brede backer kan gi overtall, men åpne kontringsrom.
- Mannorientert press kan gi trykk, men brytes av rotasjoner og tredjemannsløp.
- Smal midtbane kan gi sentral kontroll, men være sårbar mot sideskift.

> Det riktige spørsmålet er ikke «hva er best?»
> Det riktige spørsmålet er «hva er riktig nå?»

### 7. Formation Knowledge Engine

Alle formasjoner bør ha **to lag**.

**A. Spillbart datalag** (brukes av motoren). Eksempler på felter:

`id`, `name`, `era`, `baseShape`, `inPossessionShape`, `outOfPossessionShape`, `pressShape`, `strengths`, `weaknesses`, `requiredConditions`, `strongAgainst`, `weakAgainst`, `tacticalRisks`, `trainingLinks`, `playerRoleRequirements`, `parameterProfile`.

**B. Dokumentasjonslag** (brukes som lærings- og analysegrunnlag). Hver formasjon bør ha en dyp dokumentasjonsfil under `docs/hgFootball/formations/`. Hver fil bør forklare:

- historisk bakgrunn
- taktisk idé
- styrker og svakheter
- nødvendige rammebetingelser
- hvilke spillertyper som kreves
- hvilke motstandere formasjonen fungerer mot, og hvilke den sliter mot
- vanlige fallgruver
- relevante treningsprogrammer
- parameterkollisjoner mot andre taktikker
- eksempler på historiske eller moderne lag

### 8. Parameterlogikk mellom taktikker

Taktikker skal vurderes mot hverandre gjennom parametre. Hver parameter har en motparameter:

| Parameter | Motparameter |
| --- | --- |
| høyt press | direkte spill bak press |
| høy backlinje | bakromstrussel |
| lav blokk | tålmodig posisjonsspill |
| bredde | smal kompakt blokk |
| ballbesittelse | aggressivt press / bruddstyrke |
| mannorientering | rotasjoner / tredjemannsløp |
| mange spillere foran ball | kontringsrisiko |
| smal midtbane | sideskift / overlapp |
| høyt tempo | teknisk feilrate |
| hard belastning | slitasje / skaderisiko |
| relasjonell samhandling | stadige rolle-/formasjonsendringer |

### 9. Samlende designregel

> HG Football Manager skal lære spilleren taktisk korrekt standardforståelse gjennom forslag, men belønne dypere managerforståelse når spilleren gjør relevante kontekstuelle valg som forslagssystemet ikke fullt ut kan se.

Og kortere:

> Foreslåtte setups gir trygg taktisk kvalitet.
> Egne, kontekstuelle justeringer gir managerpoeng og muligheten til å slå sterkere lag.

Dette må alltid leses sammen med kjerneprinsippet: *alle spillere er gode nok – spørsmålet er om treneren forstår dem.* Læringslaget handler om å bygge den forståelsen hos spilleren.

### 10. Implementert så langt (Formation Knowledge Engine + kontekst-relevans)

Av designretningen over er denne kjeden faktisk bygget og testet. Holdt bevisst enkel: små, additive lag rundt én idé.

**Formation Knowledge Engine** – kunnskap om formasjoner i tre lag:

- *Data:* `data/hgFootball/formationKnowledge.json` – per formasjon `strongAgainst`/`weakAgainst` (mot motstanderstil-tokens), `requiredConditions`, `tacticalRisks`, `parameterProfile`, `trainingLinks`. Dekker et kuratert utvalg som skal utvides formasjon for formasjon. Valideres av `npm run audit:hg-formation-knowledge`.
- *Docs:* `docs/hgFootball/formations/*.md` – lesbar analyse per dekket formasjon.
- *Beregning:* `evaluateFormationMatchup` / `evaluateFormationVsOpponentStyles` (TS, `src/engine/evaluateFormationMatchup.ts`) – utleder hvilke spillestiler en formasjon legemliggjør og veier dem mot motstanderens styrker/svakheter → fordeler, risikoer, konkrete justeringsforslag og en samlet *lean* (`favourable` / `balanced` / `risky`). Demonstreres/valideres av `npm run sim:formation-matchup`.

**Kobling til kampdag** – `src/football-matchday-engine.js`:

- Hver motstanderprofil kan ha `matchupStyles`.
- Når en kampsesjon opprettes for en dekket formasjon, beregnes en formasjons-matchup som vises i kampplanen.
- Matchupen gir en **liten** tendens på lagstyrken (`matchupTendency`, ±5, på linje med andre små tendenslag). `teamFit` er fortsatt grunnlaget.

**Kontekst-relevant trening** – `src/football-training-week.js`:

- *Proaktivt:* trening som adresserer matchup-risikoen mot **neste** motstander er relevant (`RISK_TOKEN_TO_FOCUS`).
- *Reaktivt:* trening som fikser svakheten **forrige** kamp avslørte er relevant (kampmotorens `exposedWeaknessMetric` → `WEAKNESS_METRIC_TO_FOCUS`).
- Et relevant fokus får en liten ekstra uttelling gjennom det eksisterende treningsbonus-systemet; et irrelevant fokus får kun base. Validert av `npm run sim:training-week`.

Alt er additivt og «graceful»: uten kunnskapsdata / matchup / forrige kamp kjører kampdag og trening som før.

## Kvalitetssjekk før nye endringer

### Data

- Alle JSON-filer må være gyldig JSON.
- Alle spillerroller må peke på eksisterende rolle-id-er.
- Alle spillere bør ligge i 85–100-prinsippet.
- Nye spiller-unlocks må peke på ekte spiller-id-er, ikke arketype-id-er.
- Steder som ikke skal gi spillere, for eksempel KFUM Arena/Bislett i nåværende dataregler, må ikke få player-unlocks.
- Nye tagger bør gjenbrukes på tvers av spiller/rolle/taktikk der det er mulig.
- Lokal starttropp og offentlig startanker må ikke skrive til `visited_places` eller `hg_groundhopper_stats_v1`.
- Lokal starttropp og offentlig startanker må ikke hardkode spillerdata, koordinater eller private adresser i `app.js`.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Feilbruk skal beskrives som trenerfeil, ikke spillerfeil.
- Lagfit skal ikke bare være gjennomsnitt av enkeltspillere.
- Relasjoner skal forklare hvorfor roller støtter eller blokkerer hverandre.
- Badges skal nudge, ikke dominere.
- Lokal starttropp skal integreres i `computeAvailability()`, ikke i en parallell unlock-motor.
- Kampdag, treningsuke, Formation Knowledge og mini-season skal være additive lag rundt eksisterende motor, ikke nye konkurrerende motorer.

### UI

- Appen skal ikke hardkode spillerdata.
- Banen og managerkontoret skal være lesbart på iPad.
- Nye data skal helst kunne vises uten å bygge om app-logikken.
- Relasjonsdata vises foreløpig via lagrapporten; egen UI-metrikk kan legges til senere.
- Lokal starttropp skal vises som `Lokal starttropp`, ikke som et samlet sted.
- Offentlig startanker skal vises som offentlig valgt startsted, ikke som privat adresse.

## Videre arbeid

Følgende er de viktigste større lagene som fortsatt gjenstår eller må utvides:

1. **Rydde og styrke managerkontor-UI** – mindre skjematisk, mer spillfølelse, tydeligere hierarki, grønt taktikkbrett og bedre iPad-lesbarhet.
2. **Fullføre forslagssystemet ved alle store valg** – formasjon, kampplan, rollevalg, treningsprogram, spillerutvikling, stab/fasiliteter og administrasjon.
3. **Bygge full treningsprogram-komposisjon** – presenterte programoppsett, variasjoner og egne lagrede programsammensetninger, basert på ukentlig treningsfokus v0.2.
4. **Utvikle off-pitch-/kontekstparametre** – skjult slitasje, moral, selvtillit, relasjoner, mediepress, uro og behov for trygghet/ro.
5. **Utvide Formation Knowledge Engine** – dekke flere formasjoner, flere docs-filer, flere matchup-regler og tydeligere treningskoblinger.
6. **Koble historiske formasjoner dypere inn i aktiv lagfit/kampmotor** – uten å gjøre gamle formasjoner “dårlige”; de skal fungere når rammebetingelsene er riktige.
7. **Utvikle kampdag videre** – rikere kampforløp, flere hendelsestyper, tydeligere årsak–virkning og bedre kamprapporter.
8. **Utvikle mini-season til sesongstruktur** – liga, tabell, terminliste, sesongmål og progresjon over tid.
9. **Synliggjøre læring bedre i UI** – forklar hvorfor forslagene anbefales, hva risikoen er, og hvilke managergrep som går utover standardforslaget.
10. **Fortsette dataaudits og simulations** – alle nye data- og motorlag må ha lesbare, deterministiske sjekker.

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.
