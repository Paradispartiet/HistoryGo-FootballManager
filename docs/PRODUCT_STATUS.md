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

## Aktiv konsolideringsfase — Manager Career Flow Integrity

Fra 11.09.2026 er hovedarbeidet flyttet fra spiller-source-depth til **managerkarrierens ende-til-ende-flyt**. Produksjonsbuilden er spilt manuelt gjennom klubbvalg, før-sesong, trening, stab, motstanderanalyse, kampforberedelse, kamp og etterkamp. Motorene og innholdet er langt nok kommet; de høyeste produktgapene er nå faseprogresjon, routing og stale presentasjonsstate.

Canonical plan: [`MANAGER_CAREER_FLOW_INTEGRITY_PLAN.md`](MANAGER_CAREER_FLOW_INTEGRITY_PLAN.md).

For 2. divisjon er det systematiske source-depth-gulvet **frosset ved minst to kildebelagte styrkeprofiler per klubb**. Allerede mergede tredjeprofiler beholdes, men det kjøres ikke en automatisk 2→3→4-runde gjennom resten av divisjonen. Ny spillerresearch gjøres selektivt når en konkret profil har særskilt produktverdi.

### P1 staff — klubbspesifikke startersett

Etter grønn Manager Career Flow Integrity er staff neste synlige innholdsgap. Generiske seksrollers-placeholders beholdes kun som fallback for ukurerte klubber. Kuraterte klubber kan bruke `starterClubIds`; et klubbsett tas bare i bruk når det alene dekker hele 1 assistent + 3 trenere + 1 fysio + 1 keepertrener.

Rosenborg er første klubbsett, basert på klubbens offisielle A-lagsstab oppdatert 11.08.2026. Administrasjon bruker samtidig samme seksrollerskrav som før-sesong, slik at den gamle `6/1`-presentasjonen ikke kan komme tilbake.

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
  Bjarg har nå minst tre kildebelagte styrkeprofiler: Pesen, Axel Ahlanders
  dokumenterte spilleforståelse og beslutninger, og Jacob Jørgensens
  dokumenterte løpskapasitet. Brattvåg
  har nå minst tre, med Tobias Flems eksplisitt dokumenterte fart og Jørgen
  Galtas dokumenterte én-mot-én-ferdigheter og fart i tillegg til Ulrik
  Valderhaug Syversens lederrolle. Eik Tønsberg har nå minst tre, med Joachim
  Lundhagebakkens eksplisitt dokumenterte styrke og fart i tillegg til de to
  eksisterende kildebelagte profilene. Follo har nå minst tre, med Adam Tamrat
  Viks eksplisitt dokumenterte skuddredning i tillegg til Albert Braut Tjålands
  styrke og den eksisterende kildebelagte profilen. Junkeren har nå minst tre,
  med Mads Fagerli Halsøys eksplisitt dokumenterte avslutning i tillegg til
  Sidad Choolys dødballutførelse og Ivar Unhjems fart/avslutning. Kvik Halden
  har nå minst tre, med Øystein Lundblad Næsheims eksplisitt dokumenterte
  corner-/dødballfot i tillegg til Dardan Sæter-Mehmetis lederskap og Fabian
  Stensrud Ness' eksisterende kildebelagte profil. Pors har nå minst tre, med Jonah
  Disch Lindvigs dokumenterte treningsiver/arbeidsinnsats i tillegg til Oskar
  Sundland Johnsens bevegelse i riktige rom og den eksisterende kildebelagte
  profilen. Rana har nå minst tre, med Brede Frøysas eksplisitt dokumenterte
  arbeidsinnsats i tillegg til Dharmesh Navaratnams arbeidsinnsats og den
  eksisterende kildebelagte profilen. Sandviken har nå minst tre, med Bendik August
  Engens eksplisitt dokumenterte fart og arbeidsinnsats i tillegg til Nicholas
  Marthinussens duellstyrke og Beltran Mvukas fart.
  Sotra har nå minst tre, med Morten Grasmos konkret dokumenterte skuddredning i
  tillegg til Steffen Lie Skåleviks arbeidsinnsats og den eksisterende
  kildebelagte profilen. Trygg/Lade har
  nå minst to, med Ola Elvedahls eksplisitt dokumenterte løpskapasitet i
  tillegg til eksisterende kildebelagt profil. Træff har nå minst to, med
  Nikolai Eide Ohrs eksplisitt dokumenterte løpskraft og arbeidsinnsats i
  tillegg til eksisterende kildebelagt profil. Vidar har nå minst to, med
  Mathias Tjolands eksplisitt dokumenterte arbeidsinnsats og avslutningsevne i
  tillegg til Simen Haughom. Dermed har alle 60 klubber minst to kildebelagte
  styrkeprofiler. Dette er nå det canonicale systematiske gulvet for 2. divisjon; videre spillerresearch er selektiv og skal ikke drive en ny obligatorisk pass-runde;
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
