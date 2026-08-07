# Speiding som hovedområde v1

Speiding er et eget hovedområde i HG Football Manager:

**Kontor · Lag · Speiding · Kamp · Stats**

Dette følger samme informasjonsprinsipp som spillerlisten: oversikten brukes til å sammenligne mange, mens spillerprofilen brukes til å forstå én. Speiding introduserer ingen ny «Neste»-funksjon og konkurrerer ikke med `Forslag til neste steg`.

## Underflater

### Rekrutterbare

Viser spillere manageren har kandidattilgang til gjennom eksisterende History Go-opplåsinger, samt spillere som allerede ligger i en eksplisitt starttropp.

Fra Rekruttering v1 er skillet eksplisitt:

```text
History Go-tilgang = kandidat
Hent til troppen = troppsmedlem
```

En kvalifisert kandidat kan derfor sammenlignes og åpnes i spillerprofilen uten å være spillbar. `Hent til troppen` skriver spiller-ID-en til den eksisterende `hgfm.teamMerits.v1`-staten. Lag og kjernens availability leser samme medlemskap og oppdateres i samme økt.

Listen viser bare data spillet faktisk har:

- navn
- naturlige og brukbare posisjoner
- foretrukne roller
- hvilket History Go-sted som ga tilgang
- status `Kandidat` eller `Tropp`
- eksplisitt rekrutteringshandling når kandidaten ikke er i troppen

Det finnes ingen Overall-kolonne, lønn, alder, overgangssum eller kontraktsinformasjon som datasettet ikke eier.

History Go-portene gjelder fortsatt: landslagsarena alene gir ikke en klubb-signering, og quiz-porten respekteres når læringsloggen finnes.

### Andre klubber

Viser alle andre klubber i den eksisterende ligapyramiden. Egen klubb filtreres bort når save-state har `takeoverClubId`.

For hver klubb bruker visningen den eksisterende `listClubHeritagePlayers()`-motoren. Den kobler klubbens `homePlaceId` mot spillernes `sourcePlaceIds` og leser eventuell `clubStatus`.

Derfor er dette **HGs dokumenterte klubbtilknytninger / mulige historiske spillerpool – ikke en live stall og ikke en påstand om hvilke spillere klubben har under kontrakt i virkeligheten akkurat nå**.

`Andre klubber` er fortsatt en speider-/kunnskapsflate. Rekruttering skjer bare når spilleren faktisk finnes som kvalifisert kandidat under `Rekrutterbare`; klubbtilknytningen alene gir ingen spiller til troppen.

## Spillerprofil

Begge speiderflatene gjenbruker `manager-player-workspace-v1` sin spillerprofil gjennom `hgfm:open-player-profile`.

Det betyr at samme spiller alltid har samme:

- posisjonskart
- rolleprofil og rollefortrolighet
- ferdighetsprofil 1–20
- styrker og behov
- taktiske likes/dislikes
- History Go-opprinnelse
- misbruksvarsel

Speiding lager ingen parallell spillerprofil. Profilklikk rekrutterer heller aldri spilleren.

## Motorgrenser

Speiding v1 + Rekruttering v1 bruker eksisterende data og managerstate:

- kandidattilgang fra `player_candidate`-opplåsinger
- troppsmedlemskap i eksisterende `teamMerits`
- ingen separat transfer-/recruitment-localStorage
- ingen overgangssum
- ingen lønns- eller kontraktsmotor
- ingen bud-/forhandlingsmotor
- ingen ny fitmotor
- ingen ny spillerverdi
- ingen skriving til History Go-progresjonen

Andre klubber leses av `football_clubs.json`, `football_players.json` og `football-club-squad.js`.

## Responsive prinsipper

Desktop viser tette tabeller og klubb → spiller-drill-down. På mobil brytes tabellene til kompakte rader i stedet for en bred horisontal monster-tabell. Rekrutteringshandlingen forblir eksplisitt og trykkbar på 390 px. Browser-vaktene dekker overflow, spillerprofil, kandidat → tropp i samme økt og WCAG 2 A/AA.
