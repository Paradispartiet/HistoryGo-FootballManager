# HistoryGo Football Manager

HistoryGo Football Manager er en selvstendig managerprototype koblet til History Go / Civication. Prosjektet bygger på ett fast prinsipp:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Dette er ikke et vanlig ratingspill. `overall` beskriver klasse, ikke automatisk kampverdi. En spiller med lavere `overall` kan prestere bedre enn en høyere rated spiller dersom han brukes i riktigere posisjon, rolle, taktikk og relasjonelt mønster.

## Nåværende hovedstatus

Appen har nå flere lag:

1. **Managerkontor / startellever** – velg formasjon, taktikk, spillere og roller på banen.
2. **Individuell fitmotor** – vurderer posisjon, rolle, taktikk og feilbruk for hver spiller.
3. **Lagfitmotor** – vurderer helheten: balanse, bredde, dybde, oppbygging, press, restforsvar, relasjoner, badges og duplikatspillere.
4. **Relasjonsmotor** – vurderer om rollene hjelper eller blokkerer hverandre.
5. **History Go-unlocks** – spillere, stab, ekspertise, treningsprogrammer og badges kan knyttes til besøkte/samlede steder.
6. **Innboks / klubbuke** – trådbasert innboks, svarvalg og klubbverdier.
7. **Stab, ekspertise og trening** – staff og ekspertise åpner treningsprogrammer og badgeprogresjon.
8. **Lagidentitet** – lagklasser basert på opptjente badges og utviklingsretning.
9. **Stedsrapporter** – forklarer hva sportsteder gir manageren.
10. **Historisk formasjonsbibliotek** – egen `data/hgFootball/`-modul med historiske epoker, formasjoner, rolletyper og unlock-regler.
11. **Training Program Composition v1** – treningsvalget er nå ferdige **komposisjoner av flere økter** for uka (`src/football-training-program-compositions.js`), ikke bare ett enkelt treningsfokus:
    - Forslagene lærer spilleren gode faglige standardvalg (restitusjon/skadeforebygging, defensiv struktur, avslutningsuke, oppbygging mot press, pressuke, formasjonstilvenning, balansert uke).
    - Dynamiske parametre (slitasje, motstander, matchup, forrige kamps svakhet, trenerforståelse, treningshistorikk) avgjør uttellingen — `baseScore + contextBonus + overusePenalty + riskAdjustment`.
    - Et bevisst **kontekstuelt valg kan slå standardforslaget**; forslagene er aldri en fasit eller lås.
    - Restitusjon/skadeforebygging er **situasjonsbestemt**, ikke alltid riktig: god uttelling når slitasje/risiko tilsier det, men `overusePenalty` ved overforbruk uten grunnlag. Pressuke straffes ved høy fatigue.
    - Programmene peker tilbake til ekte treningsfokus i treningsuka og vises ved siden av den i UI — et dypere valg, ikke en erstatning.
12. **Off-pitch Parameters v1** – et eget, deterministisk kontekstlag (`src/football-off-pitch-parameters.js`) som gjør managerrollen levende: manageren må lese **kontekstsignaler**, ikke bare taktikk.
    - Modellerer menneskene rundt taktikken: fatigue/slitasje, skadefare, moral, selvtillit, autonomi, garderobestemning, medie-/styre-/familiepress, skjult mental belastning, rollefrustrasjon, kampviktighet og forventningspress (normalisert 0–100).
    - **Fatigue, slitasje, moral, press, garderobe og taktisk klarhet påvirker treningsvalg:** høy slitasje gjør restitusjon/skadeforebygging mer verdt og pressuke farligere, lav taktisk klarhet løfter formasjonstilvenning, høyt press løfter defensiv struktur, og uro + moderat press gjør den balanserte uka til en tryggere fallback.
    - Det går et bevisst skille mellom **faktiske parametre** og **synlige/halvskjulte signaler**. Forslagene (treningsprogram, suggested setups) får bare se det synlige laget (`getVisibleOffPitchSignals` / `summarizeOffPitchContext`) — aldri hele hidden-blokken. Forslagene er gode standarder, men **mangler full tilgang til skjulte signaler**.
    - Derfor kan **bevisste kontekstuelle valg slå standardforslaget**: en manager som leser at laget er tungt, at garderoben murrer eller at presset utenfra øker, kan velge bedre enn et system som bare kjenner taktikken. Dette er kjernen i læringsspillet: taktisk kunnskap **+** menneskelig/managerial vurdering.
    - UI: en kompakt **«Kontekst»**-seksjon i managerkontor-stil viser lesbare signaler (fysisk, psykisk, garderobe, press, styre/media, taktisk klarhet, skadefare), ikke bare tall. Kjør `npm run sim:off-pitch`.
13. **Inbox Event Integration v1** – den eksisterende **Innboksen** («Klubbens puls») er nå koblet til kontekstlaget (`src/football-inbox-events.js`). Innboksen fantes fra før som UI-avdeling med aktive tråder og trådarkiv; den er ikke erstattet, men gjort **levende**.
    - Trådene genereres dynamisk fra **off-pitch-parametrene, treningsprogram, kampdag og beslutninger**: medisinsk apparat (slitasje/skadefare), styret (styrepress/retning), presse (medietrykk), spillergruppe/garderobe (moral/samhold/rollefrustrasjon), assistenttrener (taktisk klarhet), trening (relevant ukeprogram), kampdag (etterspill av siste kamp) og scouting/History Go (for tynn tropp).
    - Meldingene **dramatiserer signaler** fra klubbens puls. Innboksen forteller ikke spilleren hva som er riktig: den gir bekymringer, observasjoner og press som manageren må **tolke**. Noen tråder har valg med konsekvenser (`safe`/`balanced`/`risky`/`assertive`/`defensive`), og et bevisst kontekstuelt valg kan fortsatt slå standardforslaget.
    - Valg i tråder lager et **offPitchEvent** som sendes til `applyOffPitchEvent`, slik at konteksten faktisk beveger seg (slitasje, moral, press, garderobe …). Inbox-state ligger i `teamMerits.inbox` – **aldri** i History Go-progresjonen (`visited_places` / `hg_groundhopper_stats_v1`). Motoren er ren, deterministisk og no-spam (deterministiske tråd-id-er + context hash). Kjør `npm run sim:inbox`.

14. **Match Explanation v1.5** – kampdagen **forklarer hvorfor** resultatet ble som det ble (`src/football-match-explanation-engine.js`): en deterministisk, ren forklaringsmotor binder sammen lagfit, rollefit, relasjoner, formasjon/taktikk, treningsuke, treningsprogram, off-pitch-kontekst og managergrep til konkrete årsakskjeder og åpne læringspunkter. Kamprapporten viser nå hovedforklaring, avgjørende faktorer og forslag til neste uke. Se punkt 12 under «HG Football Manager som læringsspill» og kjør `npm run sim:matchday`.
15. **Historical Opponent Archetypes v1** – motstanderne er **historiske stil-lag** brukt som læringsmotstandere (`src/football-historical-opponent-profiles.js`): 12 historiske taktiske arketyper (Ungarn 1953 → Man City 2022–23) som peker på formasjonsbiblioteket, gir en forklarende stil-matchup, og mater kampforklaring, suggested setups, treningsprogram og Mini Season. Ingen logoer/drakter/emblemer — rent historisk/faglig referanse. Se punkt 13 og kjør `npm run audit:historical-opponents`.
16. **Formation Knowledge Backfill v1** – `data/hgFootball/formationKnowledge.json` dekker nå alle formasjoner i `data/hgFootball/formations.json` med epoke, taktisk skole, faseformer, rollekrav, styrker/svakheter, læringspunkter, matchup-signaler og koblinger til relevante historiske motstanderarketyper. Audit-en feiler nå på manglende/tynne oppslag i stedet for å la gamle hull stå som warnings. Kjør `npm run audit:hg-formation-knowledge`.

17. **Formation Learning UI v1** – formasjonskunnskapen er nå synlig og spillbar i managerkontoret uten ny hovedfane eller ny liga. Valgt formasjon i «Lag & taktikk» får et kompakt læringskort med epoke/skole, kjerneidé, styrker, svakheter, rollekrav og managerhint. Den eksisterende Formasjoner-tabben bruker samme `formationKnowledge.json`-oppslag til læringspunkter, matchup-signaler og relaterte historiske motstandere. Kampforberedelsen viser «Formasjonen bak stilen» for historiske motstandere med `formationId`, suggested setups viser korte formation learning hints, og Match Explanation kan legge inn ett tydelig formasjonslæringspunkt. Data dupliseres ikke i `app.js`; UI-et leser via en ren view-model-helper.

18. **Playable Manager Flow Polish v1** – ingen ny motor: den eksisterende managerloopen er gjort tydeligere og mer spillbar. Oversikt har nå en **Neste handling-stripe** øverst med én tydelig primærhandling + 1–2 sekundære steg, utledet av eksisterende state (Club Week-fase, roster/kampklar, treningsvalg, innboks, mini-sesong). Kampforberedelsen åpner med en kompakt **kampbrief** (motstander, stil, nøkkelduell, én fare, én mulighet, anbefalt forberedelse + klar/risiko-status), og kamprapporten leder nå med det dramatiske (resultat, hovedforklaring, tre avgjørende faktorer, det kampen lærte deg, neste uke) mens den fulle analysen ligger foldet bak en skuff. Treningsprogramkortene forklarer kort «Passer nå fordi …»/«Forbereder mot …» med foldede økter. Se «Playable Manager Flow Polish v1» under «HG Football Manager som læringsspill».

19. **Role Familiarity v1** – spillere bygger **fortrolighet i en rolle ved riktig bruk over kamper** (`src/football-role-familiarity-engine.js`): «treneren forstår spilleren bedre kamp for kamp». Ren, deterministisk, additiv vekst-over-tid som aldri rører `overall`, `matchScore` eller den paritetstestede fit-motoren — perfekt/god bruk bygger fortrolighet, feilbruk forvitrer den (ingen vekst). Kontinuitet i rollene gir en liten, klampet kampstyrke-bonus (maks +5, på linje med lagklassebonusen), og rolleforståelseskortet viser en «Rolleerfaring»-meter med nivå og managerhint. Tilstanden bor i `teamMerits` (aldri i History Go-progresjonen). Se punkt 15 og kjør `npm run sim:role-familiarity`.

Dette er fortsatt ikke et ferdig spill. Kampmotor, historiske motstanderprofiler, Club Week, kamprapport (nå forklarende), Mini Season v1 og lokal starttropp finnes nå, men full liga/sesong og full simulering gjenstår.

### Formation Knowledge Backfill v1

Formasjonene i HG Football Manager er **taktiske systemer, ikke bare tallmønstre**. Kunnskapslaget i `data/hgFootball/formationKnowledge.json` beskriver derfor hver formasjon med historisk epoke, taktisk skole, grunnform, faseformer med/uten ball, pressform, lav blokk, rollekrav, styrker, svakheter, spillertyper, læringspunkter og managerhint.

Et viktig prinsipp er at gamle formasjoner ikke behandles som dårlige. En 2-3-5, WM, MM, libero-variant eller catenaccio kan fungere når manageren forstår samtidens roller, avstander, restforsvar og rammebetingelser. Feilbruk oppstår når formasjonen kopieres som et tallmønster uten relasjonene som gjorde systemet spillbart.

Formation knowledge mater nå historical opponents, formasjons-matchup, suggested setups, treningsprogram og kamp-/læringsforklaringer med samme kilde. Historiske stilprofiler beskriver laget/arketypen; formation knowledge forklarer systemet de bruker. Feltet `relatedOpponentArchetypes` binder for eksempel totalfotball-4-3-3 til Ajax 1971–73 og Nederland 1974, mens moderne 3-2-5 peker mot Man City 2022–23.

`npm run audit:hg-formation-knowledge` sjekker at alle formationIds har oppslag, at oppslag peker på gyldige formasjoner og historiske motstanderprofiler, at nøkkelfelter som `strengths`, `weaknesses`, `roleRequirements` og `learningPoints` ikke er tomme, og at gamle formasjoner har epoke/taktisk skole.

## Viktige filer

```txt
index.html
style.css
README.md

src/
  app.js
  app-manager-engine-bridge.js
  football-fit-engine.js
  football-team-fit-engine.js
  football-relationship-engine.js
  football-badge-effect-engine.js
  football-off-pitch-parameters.js
  football-inbox-events.js
  football-matchday-engine.js
  football-match-explanation-engine.js
  football-historical-opponent-profiles.js
  hg-formation-library.js

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

docs/
  local-start-squad.md

scripts/
  audit-hg-football-data.mjs
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

## Individuell fitmotor

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

## Lagfitmotor

Ligger i:

```txt
src/football-team-fit-engine.js
```

Den bygger på individuell fit og vurderer laget som helhet. `calculateTeamFit` returnerer blant annet:

```json
{
  "teamScore": 78,
  "completeCount": 11,
  "totalSlots": 11,
  "metrics": {
    "individualFitAverage": 80,
    "roleFitAverage": 76,
    "tacticFitAverage": 72,
    "misuseAverage": 8,
    "balanceScore": 74,
    "widthScore": 82,
    "depthScore": 69,
    "buildUpScore": 77,
    "pressScore": 61,
    "restDefenseScore": 70,
    "relationshipScore": 73,
    "duplicatePenalty": 0
  },
  "baseMetrics": {},
  "badgeEffects": {},
  "relationships": {},
  "assignments": [],
  "duplicatePlayers": [],
  "report": {
    "summary": "...",
    "strengths": [],
    "issues": []
  }
}
```

Badge-effekter legges forsiktig oppå base-metrics. Relasjoner inngår nå som egen `relationshipScore` og som egne rapportpunkter i styrker/problemer.

## Relasjonsmotor

Ligger i:

```txt
src/football-relationship-engine.js
```

Motoren vurderer om rollene i elleveren hjelper eller blokkerer hverandre. Den endrer ikke spillernes grunnkvalitet. Den vurderer trenerens struktur: får spillerne riktige medspillere rundt seg, eller blir styrkene isolert?

`calculateRoleRelationships(assignments, tactic)` returnerer:

```json
{
  "relationshipScore": 72,
  "positivePoints": 24,
  "negativePoints": 7,
  "positiveRelations": [],
  "negativeRelations": [],
  "involvedPlayers": {
    "widthCreators": [],
    "runners": [],
    "controllers": [],
    "holders": []
  }
}
```

## History Go-unlocks

Appen leser ekte History Go-progresjon fra localStorage:

```txt
visited_places
hg_groundhopper_stats_v1
```

Disse brukes til å finne besøkte/samlede sportsteder som finnes i Football Manager-unlockdata. Spillere velges ikke fritt: tilgjengelige spillere kommer fra `player_candidate`-unlocks på opplåste steder.

## Lokal starttropp

HG Football Manager støtter et valgfritt startvalg der brukeren kan begynne med de inntil 15 kvalifiserte fotballspillerne som er geografisk nærmest nåværende lokasjon eller valgt offentlig startsted (Haversine-avstand til koordinatfestede steder med `player_candidate`-unlocks).

Dette er en startsnarvei, ikke en erstatning for History Go-samlingen. Spillere fra lokal start kan brukes i managerdelen og teller mot 15-spillerkravet, men stedene deres markeres ikke som samlet eller besøkt i History Go. Lokal start ligger i `teamMerits.localStart`, beregnes én gang og lagres stabilt; den utvider kun spillerpoolen i `computeAvailability()` og skriver aldri til `visited_places` / `hg_groundhopper_stats_v1`. Spillerne vises med kilde `Lokal starttropp`, og `resetTeamMerits()` fjerner starttroppen.

Prinsippet er:

```txt
local_start = spillbar starttropp
visited_place = ekte History Go-samling
```

Den tekniske planen ligger i:

```txt
docs/local-start-squad.md
```

## Stab, ekspertise, trening og badges

Stab og ekspertise låses opp via steder og unlock-regler. Treningsprogrammer krever relevant ekspertise og riktig type ansatt stab. Badgeprogresjon kan gi små metriske bonuser til laget, for eksempel på press, restforsvar, oppbygging eller bredde.

## Innboks og klubbuke

Innboksen er trådbasert. Meldinger kan ha svarvalg. Svarvalg kan gi små effekter på Club Week-verdier som styretillit, moral, taktisk klarhet, treningskultur og medietrykk.

**Inbox Event Integration v1** legger et levende lag oppå den eksisterende innboksen (`src/football-inbox-events.js`): tråder genereres dynamisk fra off-pitch-kontekst, trening, kampdag og beslutninger, og rendres i de samme containerne (`inboxThreadList` / `inboxThreadArchive`). Trådene har avsender, prioritet, tags, lenket handling og eventuelle valg. Valg lager et `offPitchEvent` som oppdaterer `teamMerits.offPitch` via `applyOffPitchEvent`. Innboksen muterer aldri History Go-progresjon. Manageren må **tolke** meldingene, ikke bare følge forslaget. Kjør `npm run sim:inbox`.

## Historisk formasjonsbibliotek

`data/hgFootball/` er et eget historisk datagrunnlag for HG Football Manager. Det inneholder blant annet:

- historiske formasjonsepoker
- formasjonssystemer
- rolletyper
- spiller-/rolle-fit-regler
- staff-roller
- unlock-regler

`src/hg-formation-library.js` leser dette som et eget formasjonsbibliotek i appen. Formasjoner behandles som historiske taktiske systemer, ikke bare tall.

Audit for dette datagrunnlaget:

```bash
npm run audit:hg-football
```

eller:

```bash
node scripts/audit-hg-football-data.mjs
```


## First-Time Playthrough v1

Første spilløkt er nå styrt som en spillbar første uke, ikke som en popup-tour. Spilleren får jobben, starter en femkampers prøveperiode og ledes via **Neste handling** gjennom formasjon, startellever/roller, treningsvalg, ett innbokssignal, første kamp, kamprapport og et tydelig råd for uke 2.

- Første kamp i første playthrough prioriterer den kuraterte historiske stil-motstanderen `ajax_1971_73_total_football` («Ajax 1971–73 — Totalfotball»).
- Assistenttrener-stemmen gir korte råd i Oversikt og hjelper spilleren å starte enkelt: kampklar ellever, relevant trening mot høyt press og innboks før kamp.
- Avansert læring, kampforklaring og eksisterende systemer fjernes ikke; de tones ned/foldes bak eksisterende kompakte paneler og `<details>` der førsteuka trenger mer ro.
- State holdes minimal (`hgfm.firstTimePlaythrough.v1`) og avleder resten fra eksisterende lag-, trening-, innboks-, kamp- og mini-season-state. Den skriver ikke til History Go-progresjonen.
- Målet er å gjøre de eksisterende motorene spillbare og forståelige fra første minutt — ikke å bygge ny hovedfane, liga, økonomi, transfermarked eller kampmotor.

Validering: `npm run sim:first-time` dekker Next Action-stigen for første uke og at første mini-season-motstander er Ajax/totalfotball.

## HG Football Manager som læringsspill

> **Designretning.** Denne seksjonen beskriver hva spillet skal være, ikke hva som er ferdig bygget. Mye av poeng-, forslags- og kontekstlogikken under er foreløpig **arkitekturkrav og retning**, ikke implementert motor. Den eksisterende fitmotoren, relasjonsmotoren, lagfitmotoren og det historiske formasjonsbiblioteket er grunnmuren dette skal bygges videre på.

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

Treningsprogrammet skal bygges rundt presenterte programsammensetninger, for eksempel:

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

Dette utvider den eksisterende `data/hgFootball/`-modulen, som allerede beskriver formasjoner som historiske systemer med faseformasjoner (se *Historisk formasjonsbibliotek* over).

**B. Dokumentasjonslag** (brukes som lærings- og analysegrunnlag). Hver formasjon bør ha en dyp dokumentasjonsfil, foreslått under `docs/formations/`, f.eks. `modern_433.md`, `wm_3223.md`, `brazil_424.md`, `catenaccio_libero.md`, `conte_343.md`. Hver fil bør forklare:

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

Foreslått filstruktur (designretning, ikke ferdig):

```txt
data/hgFootball/formations/
  formations.json
  formation_matchups.json
  formation_parameters.json
  formation_training_links.json
docs/hgFootball/formations/
  235_pyramid.md
  wm_3223.md
  metodo_2323.md
  brazil_424.md
  catenaccio_libero.md
  modern_433.md
  modern_4231.md
  conte_343.md
  positional_325.md
```

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

- *Data:* `data/hgFootball/formationKnowledge.json` – per formasjon `strongAgainst`/`weakAgainst` (mot motstanderstil-tokens), `requiredConditions`, `tacticalRisks`, `parameterProfile`, `trainingLinks`. Dekker et kuratert utvalg (utvides formasjon for formasjon). Valideres av `npm run audit:hg-formation-knowledge`.
- *Docs:* `docs/hgFootball/formations/*.md` – lesbar analyse per dekket formasjon.
- *Beregning:* `evaluateFormationMatchup` / `evaluateFormationVsOpponentStyles` (TS, `src/engine/evaluateFormationMatchup.ts`) – utleder hvilke spillestiler en formasjon legemliggjør og veier dem mot motstanderens styrker/svakheter → fordeler, risikoer, konkrete justeringsforslag og en samlet *lean* (favourable / balanced / risky). Demonstreres/valideres av `npm run sim:formation-matchup`.

**Kobling til kampdag** – `src/football-matchday-engine.js` (med trofast `.js`-kopi av matchup-logikken, parity-testet mot TS):

- Hver motstanderprofil har `matchupStyles`. Når en kampsesjon opprettes for en *dekket* formasjon, beregnes en formasjons-matchup som vises i kampplanen (lean + fordeler/risikoer + «Vurder: …»-forslag).
- Matchupen gir en **liten** tendens på lagstyrken (`matchupTendency`, ±5, på linje med de andre små tendensene) – aldri hovedscore. `teamFit` er fortsatt grunnlaget.

**Kontekst-relevant trening** – `src/football-training-week.js`:

- *Proaktivt:* trening som adresserer matchup-risikoen mot **neste** motstander er relevant (`RISK_TOKEN_TO_FOCUS`).
- *Reaktivt:* trening som fikser svakheten **forrige** kamp avslørte er relevant (kampmotorens `exposedWeaknessMetric` → `WEAKNESS_METRIC_TO_FOCUS`).
- Et relevant fokus får en liten ekstra uttelling gjennom det eksisterende treningsbonus-systemet; et irrelevant fokus får kun base. *Relevante* valg belønnes, ikke alle valg. Validert av `npm run sim:training-week`.

Alt er additivt og «graceful»: uten kunnskapsdata / matchup / forrige kamp kjører kampdag og trening som før.

### 11. Mini Season v1 / League Loop v1 (prøveperiode oppå Club Week)

Fem Club Weeks er nå **én sammenhengende sportslig prøveperiode** — bygget *oppå* Club Week Orchestrator, ikke ved siden av den. Hver uke følger den samme rytmen (analyse → innboks → trening → kampplan → kampdag → oppsummering), og når uka ruller går mini-sesongen til neste kamp.

- *Motor:* `src/football-mini-season.js` – ren ESM (ingen DOM/fetch/localStorage/app-state), deterministisk: lik input gir byte-identisk JSON. Normalisert state (`historygo-football-manager.mini-season.v1`) med `status`, `weekIndex`, `points`, `wins/draws/losses`, `goalsFor/Against`, `form`, `boardExpectation`, `seasonGoal`, `opponentSchedule`, `matchHistory`, `momentum`, `boardTrustTrend`, `tacticalIdentityScore`, `trainingIdentityScore`, `contextStabilityScore` og `finalReview`.
- *Kamprekke:* en deterministisk 5-kampers schedule bygges fra de **eksisterende** motstanderprofilene (matchday-engine). Hver runde har vanskelighetsgrad, hjemme/borte, en styreforventning (`win` / `avoid_loss` / `compete` / `free_hit`) og en kort narrativ krok (hva kampen tester).
- *Resultater:* mini-sesongen **konsumerer** kampdagens resultat (ingen ny kampmotor). Poeng 3/1/0, formkurve (W/D/L), og en trygg adapter mapper utfall→stilling når kampmotoren ikke ga konkret score.
- *Styret vurderer kontekstuelt:* et tap mot eliten borte (`free_hit`) straffes langt mildere enn et tap hjemme mot et svakere lag (`win`). Tydelig taktisk/treningsmessig identitet og rolig kontekst gir tillit; kaos og uro utenfor banen trekker ned — **resultat alene avgjør ikke** styrets dom.
- *Sesongmål og retning:* et sesongmål avledes deterministisk av konteksten ved start (f.eks. høy belastning → «Få kontroll på belastningen», lav taktisk klarhet → «Bygg en tydelig spillestil»).
- *Tabell/light league:* `createMiniSeasonTable` gir en kompakt, deterministisk prøveperiode-tabell (HG-laget + rivaler, P/S/U/T/MF/MM/MD/P). Dette er **ikke** en simulert liga.
- *Kobling ut:* etter hver kamp kan mini-sesongen foreslå en off-pitch-hendelse (komponerer med `applyMatchdayOffPitchEffects`, dupliserer den ikke), som igjen kan vekke relevante innbokstråder gjennom det eksisterende innbokssystemet.
- *UI:* prøveperiode-panelet i dashbordet viser runde X av 5, neste motstander (hjemme/borte + forventning), poeng, formkurve, light-league-tabell, sesongmål og styrevurdering — kompakt sort/hvit managerkontor-stil.
- *Validering:* `npm run sim:mini-season` (hele løkken ende-til-ende) og `npm run sim:club-week` (viser at Club Week + Mini Season ruller i takt over to uker).

Dette er fortsatt **ikke** en full liga/sesong — det er en lett, spillbar v1-loop: en prøveperiode der resultater, form, styreforventninger og kontekst utvikler seg over fem kamper.

### 12. Match Explanation v1.5 (kampdagen forklarer hvorfor)

Kampdagen viser ikke lenger bare et resultat og en kort rapport — den **forklarer hvorfor** utfallet ble som det ble, slik at kampen blir et pedagogisk speil av managerens valg. Dette er en ren utvidelse av eksisterende kampdag (ingen ny liga, ingen ny hovedfane, ingen flyttede motorer, ingen skriving til History Go-progresjon).

- *Motor:* `src/football-match-explanation-engine.js` – ren ESM (ingen DOM/fetch/localStorage/app-state), **deterministisk**: lik input gir byte-identisk output, ingen ny tilfeldighet som skjuler årsakene. Den finner ikke opp nye datastrukturer; den leser kun det kampsesjonen og resultatet allerede bærer.
- *Funksjon:* `buildMatchExplanation({ result, session })` returnerer en strukturert forklaring: `headline`, `resultSummary`, `decisiveFactors`, `tacticalFactors`, `relationshipFactors`, `trainingFactors`, `offPitchFactors`, `learningPoints` og `nextWeekSuggestions`. Tomme/irrelevante kategorier utelates stille.
- *Hvilke parametre forklaringen bruker:* lagfit/`teamScore` og de taktiske metrikkene (`buildUpScore`, `pressScore`, `restDefenseScore`, `depthScore`, `widthScore`, `balanceScore`), individuell rollefit (`roleFitAverage`), relasjoner (`teamFit.relationships` → positive/negative koblinger med egne forklaringer), valgt formasjon + historisk fit, valgt taktikk, formasjons-matchup mot motstanderens spillestil, ukens treningsfokus, treningsprogram-historikk (recovery/press), off-pitch-konteksten (moral, selvtillit, samhold, slitasje, skadefare, medie-/styrepress, taktisk klarhet) og managergrepene i kampen (beste/svakeste grep). Den skjulte uroen vises bare som et vagt hint, aldri som tall (off-pitch-modulens hidden-prinsipp).
- *Kobling inn:* kampmotoren snapshotter relasjoner og off-pitch-kontekst **slik de var før kampen** når en sesjon opprettes (`createMatchdaySession`), og `finalizeMatchdaySession` legger forklaringen på resultatet (`result.explanation`) — så den overlever en reload. `app.js` sender inn `relationships` og `offPitchContext`, og kamprapporten viser forklaringen øverst (kort hovedforklaring, avgjørende faktorer, taktiske og menneskelige læringspunkter, forslag til neste uke).
- *Konkret og lærende, ikke fasit:* forklaringene peker på årsakskjeder («Svakt restforsvar gjorde laget sårbart for kontringer», «Pressuka slo negativt ut fordi laget allerede var tungt fysisk», «Lav moral og høyt medietrykk gjorde laget mer sårbart etter baklengsmål»). Læringspunktene er formulert slik at spilleren kan gjøre et annet bevisst valg neste gang — i tråd med at misbruk er en managerfeil, ikke en spillersvakhet.
- *Validering:* `npm run sim:matchday` verifiserer nå at hvert resultat har en `explanation` med alle felter, at `decisiveFactors`/`learningPoints` ikke er tomme, at motoren er deterministisk, og at off-pitch-/relasjons-/treningsfaktorer dukker opp når inndata tilsier det.

### 13. Historical Opponent Archetypes v1 (historiske stil-lag som motstandere)

Kampdagens motstandere er ikke lenger generiske roboter (`high_press_4222`, `low_block_532`), men **historiske stil-lag** brukt som **læringsmotstandere**: kjente taktiske arketyper fra fotballhistorien. Hver motstander har en historisk stilprofil — hvilket stilideal og hvilken taktisk skole den representerer, hvilken formasjon den bygger på, hvilke rom den angriper og beskytter, hva den er historisk kjent for, og hva manageren må forstå for å spille mot den. Dette er en ren utvidelse av eksisterende kampdag: **ingen ny liga, ingen ny hovedfane, ingen flyttede motorer, ingen skriving til History Go-progresjon, ingen tilfeldighet som skjuler årsakene.**

**Dette er historiske/taktiske læringsprofiler — ikke lisensierte klubbrepresentasjoner.** Ingen logoer, drakter, klubbemblemer eller offisiell grafikk brukes noe sted; referansen er rent tekstlig og faglig. UI viser både historisk referanse og et arketypenavn, f.eks. «Ajax 1971–73 — Totalfotball», «Milan 1989 — Kompakt sonepress», «Barcelona 2011 — Posisjonell kontroll».

- *Modul:* `src/football-historical-opponent-profiles.js` – ren ESM (ingen DOM/fetch/localStorage/app-state), **deterministisk**. 12 profiler i v1: Ungarn 1953, Brasil 1970, Ajax 1971–73, Nederland 1974, Inter/catenaccio 1960-tallet, Milan 1988–90 (Sacchi), Barcelona 2008–12, Arsenal 2003–04, Leicester 2015–16, Liverpool 2018–20, Manchester City 2022–23 og Conte-Chelsea 2016–17.
- *Struktur:* hver profil bærer rike lærefelt (`displayName`, `archetypeName`, `era`, `referenceTeam`, `referenceCoach`, `keyPlayers`, `tacticalSchool`, `formationId`, fase-shapes, `buildUpStyle`, `attackingStyle`, `tempo`, `riskLevel`, `strengths`, `weaknesses`, `vulnerableZones`, `dangerZones`, `keyBattles`, `managerHints`, `historicalNote`, `learningFocus`) **og** er runtime-kompatibel med de generiske motstanderprofilene (`strength`, `pressResistance`, `defensiveStructure`, `transitionThreat`, `chanceConversion`, `style`, `matchupStyles`, `pressurePoints`). I tillegg bærer den et `styleTraits`-objekt (0–100) som matchup-vurderingen leser. `baseStyleId` peker på en generisk stil-familie så kampmotorens hendelsesbibliotek gir en passende motstanderhendelse.
- *Peker på formasjonsbiblioteket:* hver profil peker på en eksisterende `formationId` i `data/hgFootball/formations.json` (formasjonene dupliseres ikke). `formationFallback` markerer en eventuell trygg tilnærming; auditen krever at hver `formationId` finnes eller har eksplisitt fallback.
- *Matchup-vurdering:* `evaluateHistoricalOpponentMatchup({ teamFit, formation, tactic, trainingFocus, weeklyTrainingProgram, opponentProfile, relationships, offPitchContext })` returnerer `{ matchupScore, riskLevel, advantages, vulnerabilities, keyBattles, recommendedPreparation, explanationTags, historicalLearningPoint, summary }`. Den veier minst eget `buildUpScore` mot motstanderens press, `restDefenseScore` mot overgangsstyrke, `widthScore` mot lav/smal blokk, `depthScore` mot høy linje, `pressScore` mot kort oppbygging, `balanceScore` mot kontroll/dominans, `relationshipScore` mot komplekse systemer, taktisk klarhet mot kompleksitet, slitasje mot intensitet og treningsforberedelse mot stilen. `matchupScore` er en **tendens** (rundt nøytrale 50), aldri en fasit.
- *Kobling inn:* kampmotoren regner ut den historiske matchupen i `createMatchdaySession` (når motstanderen er en arketyp) og legger den på sesjonen og resultatet. **Match Explanation v1.5** får en egen historisk stil-faktor (`historicalFactors`) og et historisk læringspunkt («Ajax-stilen presset deg høyt; svak oppbygging gjorde første fase dyr», «Catenaccio trakk seg lavt; dybdeløpene fikk mindre verdi uten bredde»). **Suggested setups** leser motstanderens svakheter/trykkpunkter/matchupStyles som før (nå historisk). **Training Program Composition** får små, forklarbare opponent-context-bonuser (kompleks stil løfter formasjonstilvenning; høyintensiv stil løfter restitusjon når kroppene er tunge). **Mini Season** setter opp prøveperioden mot historiske stil-lag. Kampforberedelsen i UI viser en kompakt boks (historisk stil, formasjon, nøkkelduell, managerhint) før avspark.
- *Validering:* `npm run audit:historical-opponents` (alle profiler har nødvendige felt, unike id-er, gyldig `formationId`/fallback, `matchupStyles` i vokabular, ingen logo/drakt/emblem-felt, deterministisk matchup uten crash). I tillegg dekker `npm run sim:matchday`, `npm run sim:formation-matchup`, `npm run sim:suggested-setups` og `npm run sim:training-programs` at kampdag, formasjons-matchup, forslag og trening leser historiske motstandere.

### 14. Playable Manager Flow Polish v1 (eksisterende loop, tydeligere og mer spillbar)

Systemene fantes allerede (flow-audit, kampforklaring, historiske motstandere, formasjons-/rolle-/stabslæring). Dette er **ikke en ny motor**, men en presentasjons- og prioriteringspolering som gjør appen mer som ett **manager-spill** og mindre som en samling tekniske paneler. **Ingen ny hovedfane, ingen ny liga/økonomi/transfermarked, ingen flyttede motorer, ingen skriving til History Go-progresjon, ingen endring i kamp-/scoring-/off-pitch-/unlock-regler.**

- **Neste handling (Oversikt):** en ny stripe øverst på Oversikt viser hvor i uka treneren er (uke + Club Week-fase) og **hva han bør gjøre nå** — én tydelig primærhandling (stor, invertert knapp) + opptil to sekundære «chips». Selve prioriteringen bor i en **ren, deterministisk motor**, `src/football-next-action.js` (`computeNextActions(context)`), som tar inn et rent kontekstobjekt (ingen DOM/fetch/localStorage/app-state) og returnerer en prioritert liste med handlingsbeskrivelser. `src/app.js` bygger konteksten fra **eksisterende state** (`buildNextActionContext`) — pågående kampsesjon, roster readiness (15-kravet), tomme/feilbrukte/dupliserte plasser i startelleveren, Club Week-matchday-porten, treningsvalg for uka, kampklar-status, uleste innbokstråder, ulest kamprapport og mini-sesongstatus — og oversetter hver beskrivelse til en faktisk handler (`activateTab`, `selectSlotDecision`, `startMiniSeason`, `advanceClubWeekPhaseAction`) via `resolveNextActionRun`. Verbene er spillbare: «Fullfør startelleveren», «Velg roller», «Velg treningsprogram», «Les innboksen», «Spill kamp», «Se kamprapporten», «Start prøveperiode», «Gå til neste fase/uke». Prioriteringen er også fasefølsom: i innboksfasen løftes uleste tråder foran trenings-/kampvalg, og i review-fasen løftes ulest kamprapport før ny uke. Ingen ny spillmotor — kun prioritert presentasjon. **Sett-flagg:** en fersk kamp regnes som «ulest» til manageren faktisk åpner Kamp-flaten (`lastSeenMatchId` i matchday-state, persistert), så «Se kamprapporten» forsvinner når rapporten er sett.
- **Kampforberedelse:** før avspark åpner kampkortet med en kompakt **kampbrief** — motstander, stil/arketyp, nøkkelduell, **én fare**, **én mulighet**, anbefalt forberedelse og en **klar/risiko-statuschip** — slik at treneren intuitivt ser «dette er laget jeg møter, dette prøver de på, dette må jeg passe på». Alt er rene utdrag fra den eksisterende motstander-/stil-matchup-/formasjons-matchup-dataen; de fulle profilene ligger som før under briefen.
- **Kamprapport (mindre datadump):** rapporten leder nå med det dramatiske — **resultat** (stor score + utfall), **hovedforklaring**, **tre avgjørende faktorer**, **«Det kampen lærte deg»** (én taktisk, én rolle-/relasjons- og én trenings-/off-pitch-læring) og **«Neste uke bør du vurdere …»**. Den fulle analysen (managergrep, systemdom, nøkkelfaktorer, kampanalyse, kampkonsekvens og de komplette forklaringslistene) ligger foldet bak en «Full kampanalyse»-skuff. Ingen informasjon er fjernet — den er prioritert.
- **Treningsprogram-lesbarhet:** programkortene viser kort «**Passer nå fordi:** …» og «**Forbereder mot:** …» (vist når programmet er foreslått pga. neste motstander), og øktlisten er foldet i en kompakt details-skuff så kortet ikke domineres av detaljer.
- **Innboks-prioritering:** levende tråder åpner med tydelig avsenderrolle (fysio, assistenttrener, styret, presse, spillergruppe, trenerteam osv.) og en kompakt «Betyr noe for»-linje som markerer om tråden påvirker trening, kampplan, moral, slitasje, styrepress eller tropp. Det gjør klubbens puls raskere å lese uten å legge til et mer komplekst innbokssystem.
- **Stil:** alt holder seg i den eksisterende sort/hvitt-managerkontorstilen (tynne hvite rammer, grønntoner kun der bane/taktikk krever det). CSS er lagt ryddig i de relevante eksisterende seksjonene i `style.css` (Oversikt/decision-strip, Kampdag), ikke som tilfeldige tillegg nederst.
- **Validering:** `npm run sim:manager-flow-ui` (`scripts/simulate-manager-flow-ui.mjs`) tester den rene Next Action-motoren isolert — riktig primærhandling per tilstand, gating (pågående kamp / Club Week-port), sett-flagget for kamprapporten, determinisme og ryddige handlingsbeskrivelser. `npm run check:dom-ids` og `npm run audit:flow` dekker at de nye DOM-id-ene finnes og at spilløkka fortsatt henger sammen. `ci.yml` er samtidig brakt à jour med suiten (manglende `audit:historical-opponents`, `sim:role-learning`, `sim:staff-identity` lagt til ved siden av den nye sim-en). Hele suiten (`typecheck`, `build`, alle `audit:*`/`sim:*`) er grønn.

### 15. Role Familiarity v1 (spillere vokser i rollen ved riktig bruk)

Den mest kjernetro neste-featuren: **«Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.»** En spiller bygger nå **fortrolighet** i en rolle ved å bli brukt RIKTIG der over kamper — treneren (og spilleren) forstår rollen bedre kamp for kamp. Feilbruk bygger ikke forståelse; den forvitrer den litt. **Dette er ingen ny rating og rører ALDRI `overall`, `matchScore` eller den paritetstestede fit-motoren** — det er en additiv, forklart vekst-over-tid som lever ved siden av motorene (som badge-/lagklasse-bonusene).

- *Motor:* `src/football-role-familiarity-engine.js` – ren ESM (ingen DOM/fetch/localStorage/app-state), **deterministisk**. Tilstanden er et flatt oppslag `"<playerId>::<roleId>" → 0–100` som eies og persisteres av `app.js` i `teamMerits.roleFamiliarity` — **aldri** i History Go-progresjonen (`visited_places` / `hg_groundhopper_stats_v1`).
- *Vekstregler:* etter en spilt kamp vokser fortroligheten for hver startspiller etter fit-status (`perfekt` +9, `god` +6, `brukbar` +4), mens `feilbrukt` gir −5. Verdiene er små, så fortrolighet tar flere kamper å bygge; den klampes til 0–100. Misbruk forklares fortsatt som en **managerfeil** — her gir det simpelthen ingen vekst, så poenget forsterkes.
- *Liten, underordnet bonus:* `summarizeLineupFamiliarity` gir en klampet kampstyrke-bonus (0..+5, snitt-skalert) som mates additivt inn i `calculateMatchStrength` via en ny, bakoverkompatibel `roleFamiliarityBonus`-parameter (default 0 → identisk oppførsel for eksisterende kamper). Den ligger på linje med lagklasse-/matchup-tendensene og avgjør **aldri** et utfall alene. Kampplanen før avspark viser bonusen eksplisitt når den slår ut, og `strengthSnapshot.modifiers.roleFamiliarityBonus` gjør den sporbar.
- *Synlig læring:* rolleforståelseskortet i sidepanelet («Lag & taktikk») viser en **«Rolleerfaring»-meter** med nivå (Ny → I utvikling → Etablert → Mester) og et managerhint som oppmuntrer til kontinuitet. Måleren blir grønn først når fortroligheten er etablert.
- *Kobling inn:* `app.js` beregner bonusen fra den valgte startelleveren ved kampstart, og registrerer fortrolighet én gang per fullført kamp (`recordRoleFamiliarityFromMatch`) fra den låste startelleveren. Ingen endring i unlock-/scoring-/off-pitch-regler.
- *Validering:* `npm run sim:role-familiarity` (`scripts/simulate-role-familiarity.mjs`) dekker vekstregler, klamping, rollespesifisitet, ren funksjonell oppdatering (ingen mutasjon), nivåbeskrivelser, lineup-oppsummering + bonus, normalisering av korrupte data og determinisme. `npm run sim:matchday` bekrefter at standardoppførselen (uten bonus) er uendret.

## Kvalitetssjekk før nye endringer

### Data

- Alle JSON-filer må være gyldig JSON.
- Alle spillerroller må peke på eksisterende rolle-id-er.
- Alle spillere bør ligge i 85–100-prinsippet.
- Nye spiller-unlocks må peke på ekte spiller-id-er, ikke arketype-id-er.
- Steder som ikke skal gi spillere, for eksempel KFUM Arena/Bislett i nåværende dataregler, må ikke få player-unlocks.
- Nye tagger bør gjenbrukes på tvers av spiller/rolle/taktikk der det er mulig.
- Lokal starttropp må ikke skrive til `visited_places` eller `hg_groundhopper_stats_v1`.
- Lokal starttropp må ikke hardkode spillerdata eller koordinater i `app.js`.

### Motor

- `overall` skal aldri alene avgjøre resultatet.
- Feil rolle/posisjon skal gi tydelig utslag.
- Feilbruk skal beskrives som trenerfeil, ikke spillerfeil.
- Lagfit skal ikke bare være gjennomsnitt av enkeltspillere.
- Relasjoner skal forklare hvorfor roller støtter eller blokkerer hverandre.
- Badges skal nudge, ikke dominere.
- Lokal starttropp skal integreres i `computeAvailability()`, ikke i en parallell unlock-motor.

### UI

- Appen skal ikke hardkode spillerdata.
- Banen og managerkontoret skal være lesbart på iPad.
- Nye data skal helst kunne vises uten å bygge om app-logikken.
- Relasjonsscore vises som egen metrikk i «Lagets profil», og lagrapporten lister hvilke roller som støtter eller blokkerer hverandre (positive/negative relasjoner med forklaring).
- Lokal starttropp skal vises som `Lokal starttropp`, ikke som et samlet sted.

## Ikke ferdig ennå

Følgende gjenstår som større spill-lag:

- full liga (mange lag, full tabellsimulering) — Mini Season v1 dekker foreløpig kun en lett 5-kampers prøveperiode med deterministisk light-league-tabell
- lengre sesong over flere prøveperioder (økonomi, overgangsmarked, kontrakter, kalender)
- full kobling mellom historisk formasjonsbibliotek og aktiv kampmotor

Allerede bygget (se «Implementert så langt»): motstanderprofiler, kampmotor (Kampdag v0.2), kamprapport etter kamp, ukekamp (Club Week Orchestrator v1), en spillbar prøveperiode med poeng/form/tabell (Mini Season v1 / League Loop v1) og lokal starttropp i runtime via `computeAvailability()`.

## Neste anbefalte utviklingsrekkefølge

1. Test managerkontoret i nettleser/iPad etter Mini Season v1 / League Loop v1 og lokal starttropp.
2. Koble historiske formasjoner fra `data/hgFootball/` dypere inn i aktiv lagfit/kampmotor.
3. Bygg videre fra Mini Season v1 til full liga og sesong.

## Fast regel for videre arbeid

Ikke bygg nye lag på en måte som gjør prosjektet til et vanlig rating-spill.

Alt videre arbeid skal bevare denne setningen:

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

### Player Role Learning v1

Rollevalg i managerkontoret er nå et læringsobjekt, ikke bare et dropdown-valg. Slot-editoren i «Lag & taktikk» viser et kompakt «Rolleforståelse»-kort for valgt spiller/rolle: spillerprofil, rollens kjernekrav, hva spilleren får brukt, hva feilbruk skjuler, relasjoner som hjelper eller advarer, ett formation-knowledge-hint og ett konkret managerhint.

Laget bygger på eksisterende `football_roles.json`, `football_player_archetypes.json`, spillerdata, `football-fit-engine.js`, `football-team-fit-engine.js`, `football-relationship-engine.js` og `formationKnowledge.json`. Misbruk forklares som et manageransvar: alle spillere er gode, men manageren må forstå hvilke situasjoner rollen gir dem.

Match Explanation kan nå løfte frem ett tydelig rollebruk-/relasjonspunkt etter kamp, og suggested setups kan gi korte rollehint når formasjon, trening eller lagfit tilsier det. Dette skriver ikke til History Go-progresjon og legger ikke til ny hovedfane eller liga.

### Staff & Training Identity v1

Stab er nå et spillbart lærings- og støttelag, ikke bare opplåste navn eller krav. `src/football-staff-identity-engine.js` bygger en deterministisk identitet fra eksisterende `football_staff.json`, `football_expertise.json`, unlocks og `teamMerits`: trenerteamets styrker, hull, faglige biaser, aktive staff-stemmer og History Go-kompetanse.

- Assistenttreneren gir helhetlige signaler om rollefit, formasjonstilvenning og kampforberedelse.
- Trenerteamet støtter relevante treningsprogrammer gjennom små, forklarbare ekspertisebonuser.
- Keepertrener-kompetanse gjør keeperdistribusjon, sweeperkeeper-bruk og defensiv dødball mer pedagogisk synlig.
- Fysio-/belastningskompetanse leser fatigue, wear og injuryRisk tydeligere før harde treningsuker.
- Staben gir råd og støtte, men overtar aldri valget: manageren må fortsatt tolke kontekst, risiko og timing.
- History Go-unlocks vises som tilgang til kompetanse og som mulige mangler som kan låses opp via relevante sportsteder/klubber; manageren skriver ikke til History Go-progresjon fra dette laget.

Kjør `npm run sim:staff-identity` for en lett sim av tom stab, relevant stab, fysio-/assistentstøtte, treningsprogramscoring, innbokssignaler og kampforklaring med staff context.
