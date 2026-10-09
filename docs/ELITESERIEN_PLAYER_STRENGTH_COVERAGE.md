# Eliteserien: spillerkvalitet og dekningsregister (fase A)

Dette er en **read-only produksjonsaudit**, ikke et nytt spillersystem. Den
leser canonical katalog, klubbpool og eksisterende P1-, P2- og source-depth-
registre, og bruker det samme kildeoverlegget som spillermotoren.

## Kjøring

Fra repo-roten:

- **--check**: beregn og kontroller rapporten, skriv oversikt over alle 16 klubber.
- **--csv**: én rad per klubbtilknytning, inkludert spiller-ID, posisjoner,
  kilde, registrerte/effektive styrker, prioritet, spillbarhet og grunntropp.
  Kan omdirigeres til en CSV-fil for kildearbeid.
- **--json** (eller uten flagg): strukturert JSON med klubb-/posisjonsdekning
  og alle spillerader.

Kjør for eksempel:

    node scripts/audit-eliteserien-player-strength-coverage.mjs --check
    node scripts/audit-eliteserien-player-strength-coverage.mjs --csv > /tmp/player-coverage.csv

Skriptet skriver **aldri** tilbake til spillerkatalog, kilderegistre eller
klubbdata. Kommandoene er deterministiske for den aktuelle commiten. For
før-/ettersammenligning brukes to bestemte commit-SHA-er. Det finnes ingen
tvungen 100 %-kvote.

## Telleregler

- **Nevner:** hver eksplisitt klubbtilknytning (clubAffiliations) i
  Eliteserien. En spiller med flere dokumenterte tilknytninger telles
  i flere klubbpooler, men bare én gang i uniqueAffiliatedPlayers.
- **Med styrker:** effectiveStrengths har minst ett token etter samme
  overlay-rekkefølge som runtime: P1 → P2 → source-depth.
- rawStrengths kommer direkte fra spillerkatalogen. catalogue_raw betyr
  at det **ikke** er angitt en individuell claim-URL i P1/P2/depth for
  disse styrkene. Dekning er derfor ikke det samme som kontrollert
  kildeproveniens. Begge målene vises.
- p1Heritage og p1Status følger P1-eierskapet også når styrkelisten er
  tom. P1-eide profiler skal behandles i P1-laget.
- P2_SNL_owned behandles bare innenfor eksisterende SNL-kontrakt.
  source_depth_eligible gjelder bare profiler uten P1/P2-eierskap,
  uten råstyrker og med belagt tilknytning til den aktuelle klubben.
- Spillbarhet avgjøres med listPlayableClubPoolPlayers.
  inNoVisitBaseSquad beregnes med resolveClubSquadAccess, uten
  stadionbesøk, med samme nasjonale kandidatfilter som eksisterende
  simulate-club-squad-audit. Dette er managerens **automatiske
  grunntropp**, ikke en historisk førsteellever.
- byPrimaryPosition bruker første naturlige posisjon, ellers første
  brukbare posisjon, ellers UNPROFILED; hver tilknytning telles én gang.
  Hele posisjonslisten finnes i spilleradene.

## Forskningsprioritet

Prioriteten må aldri automatisk generere eller estimere styrker:

1. **high_base_squad**: spillbar, uten styrker og i automatisk grunntropp.
2. **medium_playable_pool**: spillbar, uten styrker, øvrig klubbpool.
3. **needs_position_evidence**: uten styrker og uten dokumentert spillbar
   posisjon. Posisjonen må dokumenteres separat før manageruttak er mulig.
4. **covered**: har allerede en registrert effektiv styrke. Disse kan fortsatt
   ha svak proveniens og dermed trenge egen kildekontroll.

Pilotproduksjon begynner med **Sandefjord**, så **Aalesund**, med én egen PR
per klubb. Bruk CSV-rapportens klubbfilter og kontroller hver konkret
ferdighetspåstand mot kildehierarkiet. Et manglende funn skal aldri erstattes
med antatt spillestil, klubbstatus, meritter, classHeight eller målstatistikk.

## Avgrensning

Auditen endrer ingen spilleridentiteter, klubbtilknytninger, posisjoner,
styrker, kampmotor eller skjulte totalscorer. CI validerer registerets
integritet, ikke et måltall for antall ferdighetsbeskrivelser.
