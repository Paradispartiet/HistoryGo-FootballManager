# Canonical produktstatus

Denne filen er inngangen til **hva som faktisk finnes i HistoryGo Football Manager nå**. Den skal hindre at historiske audits, gamle veikart eller foreldede README-avsnitt blir tolket som åpne arbeidsoppgaver.

## Slik avgjøres status

En funksjon regnes som implementert når den har:

1. live kode eller data i den spillbare flaten;
2. dokumentert state- og motorgrense;
3. permanent audit eller deterministisk simulering;
4. browservern når funksjonen er interaktiv;
5. vært gjennom grønn CI og merge til `main`.

Et gammelt dokument med «gjenstår» overstyrer aldri nyere kode og permanente porter. Før en ny hovedoppgave startes, søk etter funksjonsnavn, statefelt, audits, browsertester og merged commits.

## Nåværende produktstruktur

Ligaspillet bruker:

```text
Kontor · Lag · Speiding · Kamp · Stats
```

Underflatene er beskrevet i [`meny.md`](meny.md) og [`MANAGER_SHELL_V3.md`](MANAGER_SHELL_V3.md). Nye arbeidsflater skal plasseres i denne strukturen før en ny hovedfane vurderes.

## Implementerte hovedkontrakter

| Område | Implementert kontrakt | Permanente bevis |
| --- | --- | --- |
| Manageruke | Aktiv ligasave starter i Kalender; vedvarende footer viser aktuell dag og neste hendelse over eksisterende Club Week-state | `MANAGER_CALENDAR_V1.md`, `manager-calendar-v1`, `manager-match-calendar-v1` |
| Klubbkommunikasjon | Konkrete mailer bruker faktisk state, managerspørsmål, observasjonspunkt og presise arbeidslenker | `MANAGER_CLUB_COMMUNICATION_V3.md`, `audit:manager-club-communication-v3`, `sim:manager-club-communication-v3` |
| Spillerpool og tropp | History Go-samling og klubbtilgang utleder poolen; `squadPlayerIds` eier valgt klubbtropp | `MANAGER_RECRUITMENT_V1.md`, `audit:manager-recruitment-v1`, `sim:manager-recruitment-v1` |
| Spillerliste og profil | Tett sammenligningsliste, delt spillerprofil og eksplisitt Velg/Sett inn uten Overall | `PLAYER_LIST_PROFILE_V1.md`, `manager-player-workspace-v1` |
| Faktisk ellever og roller | Rolleinspektøren leser dagens ellever og forklarer navngitte relasjoner og rom | `MANAGER_FOOTBALL_LEARNING_LOOP_V1.md`, `audit-manager-football-learning-loop-v1` |
| Systemkunnskap | Formasjon, kampplan, historisk fit og formasjonsmatchup forklares over eksisterende motor | `MANAGER_SQUAD_TACTICS_SCENE_V2.md`, `TACTICAL_KNOWLEDGE_LAYER.md`, `audit:hg-formation-knowledge` |
| Treningsuke | Program, fire økter, fokus og individuell oppfølging samles i eksisterende plan | `MANAGER_TRAINING_SCENE_V2.md`, `sim:training-plan` |
| Øvelsesdesign | Konkrete økter lar manageren endre areal, spillerbalanse, retning og touchregel | `MANAGER_TRAINING_EXERCISE_DESIGN_V1.md`, `audit:manager-training-exercise-design-v1` |
| Trening til kamp | Konkret øvelsesdesign lagres i modussesjonen og følger gjennom kampforberedelse, observasjonsøyeblikk, motorens dom, usikkerhet og eksplisitt forslag til neste uke | `MANAGER_FOOTBALL_LEARNING_LOOP_V1.md`, `manager-football-learning-loop-v1.spec.js` |
| Motstanderforberedelse | Faktisk fixture og motstanderprofil blir hypotese, motgrep, risiko og observasjonspunkt | `football-opponent-analysis.js`, `manager-opponent-analysis-preparation-v1.spec.js` |
| Medisinsk arbeid | Faktisk skade/belastning følger fem synlige trinn fra individuell rehabilitering til kampklarhetsvurdering; managerens plan og faktiske kampminutter sammenlignes uten ny medisinsk motor eller lagringsnøkkel | `football-medical-decision-learning.js`, `sim:medical-rehabilitation-v2`, `manager-medical-decision-learning-v1.spec.js` |
| Kampdag | Eksisterende kampmotor driver forberedelse, live kamp, managergrep og rapport | `MANAGER_MATCHDAY_SCENE_V1.md`, `sim:matchday` |
| Etterkamp | Resultat, xG, faktorer, spillerbidrag og klubbkonsekvenser samles uten ny beregning | `MANAGER_POST_MATCH_ANALYSIS_V1.md`, `audit:manager-post-match-analysis-v1` |
| Ligaspill | Divisjoner, terminliste, tabell, kvalifisering, sesongdom og spillerstatistikk | `football-league-season.js`, `sim:league-season`, `sim:league-playoff` |
| Andre moduser | Scenario, landslag/turnering og Fotballvitenskap er isolerte modussnapshots | `football-mode-sessions.js`, `sim:mode-isolation`, `sim:tournament` |
| Klubborganisasjon | Trenerteam, treningsanlegg, medisinsk apparat, analyse, styre, administrasjon og stadion ligger under Klubben | `MANAGER_CLUB_ORGANIZATION_V1.md`, `audit:manager-club-organization-v1` |

## Avtalte ikke-systemer

Disse skal ikke gjeninnføres som «neste naturlige steg» uten at produktregelen først bestemmes:

- overgangsmarked og tilfeldige markedskandidater;
- overgangssummer, lønn, kontrakter, agenter og forhandling;
- hard maksimumsgrense, registreringsfrist eller bytte-cooldown for klubbtroppen;
- fasilitetsnivå 1–3 uten dokumenterte anleggsdata;
- ny kamp-, trening-, rekrutterings-, medisinsk- eller analysescore;
- skjulte pedagogiske bonuser;
- parallelle manageruker eller generiske «Neste»-veivisere ved siden av kalenderfooteren.

Legacy-kode kan beholdes for save-migrering og monolittkompatibilitet. Det gjør ikke det gamle systemet til en live produktretning.

## Reelt åpent arbeid

Åpent arbeid skal være konkret og kilde- eller regelavklart. Per denne statusen er følgende typer arbeid gyldige uten å dikte produktregler:

- **fordype dokumenterte spillerpooler som er komplette, men grunne.** Ingen klubb
  står lenger `pending` — alle 60 har en pool på minst femten spillbare — men
  bredden kom fra registeret. Bjarg har nå fått sin første kildebelagte
  styrkeprofil via Pesen, Brattvåg via Ulrik Valderhaug Syversens eksplisitt
  dokumenterte lederrolle, Junkeren via Ivar Unhjems eksplisitte beskrivelse
  som hurtig og solid avslutter, Sandviken via Beltran Mvukas eksplisitte
  beskrivelse av egen fart og Vidar via Simen Haughoms eksplisitte beskrivelse
  som hardtarbeidende skarpskytter. Ingen av de 60 klubbene står nå på null
  kildebelagte styrkeprofiler. Første videre dybdepass er også materialisert:
  Bjarg har nå minst to kildebelagte styrkeprofiler, med Axel Ahlanders
  dokumenterte spilleforståelse og beslutninger i tillegg til Pesen. Brattvåg
  har også minst to, med Tobias Flems eksplisitt dokumenterte fart i tillegg
  til Ulrik Valderhaug Syversens lederrolle. Follo har nå minst to, med Albert
  Braut Tjålands eksplisitt dokumenterte styrke i tillegg til eksisterende
  kildebelagt profil. Junkeren har nå minst to, med Sidad Choolys eksplisitt
  dokumenterte dødballutførelse i tillegg til Ivar Unhjem. Kvik Halden har nå
  minst to, med Dardan Sæter-Mehmetis eksplisitt dokumenterte lederskap i
  tillegg til eksisterende kildebelagt profil. Pors har nå minst to, med Oskar
  Sundland Johnsens eksplisitt dokumenterte bevegelse i riktige rom i tillegg
  til eksisterende kildebelagt profil. Rana har nå minst to, med Dharmesh
  Navaratnams eksplisitt dokumenterte arbeidsinnsats i tillegg til eksisterende
  kildebelagt profil. Sandviken har nå minst to, med Nicholas Marthinussens
  eksplisitt dokumenterte duellstyrke i tillegg til Beltran Mvukas fart.
  Sotra har nå minst to, med Steffen Lie Skåleviks eksplisitt dokumenterte
  arbeidsinnsats i tillegg til eksisterende kildebelagt profil. Videre
  dybdearbeid skal øke belegg, ikke senke noen terskel;
- forbedre redaksjonell spiller-, klubb- og fotballkunnskap med kildebelegg;
- rette målbare flyt-, tilgjengelighets-, mobil- og integrasjonsfeil;
- fordype eksisterende arbeidsverksteder når valgene fortsatt bruker samme autoritative motor;
- rydde legacy-presentasjon når permanente save-migreringer og regresjonsvern bevares.

Troppsgrenser, overgangsregler og fasilitetseffekter er ikke åpne kodeoppgaver før reglene er besluttet.

## Oppdateringsregel

Når en ny hovedkontrakt merges:

1. oppdater tabellen over implementerte kontrakter;
2. fjern motstridende påstander fra README og aktive produktdokumenter;
3. legg statusbeviset i `scripts/audit-product-status.mjs`;
4. behold historiske dokumenter som historikk, men merk dem tydelig dersom de beskriver en utgått struktur.
