# Speiding som hovedområde v1

Speiding er et eget hovedområde i HG Football Manager:

**Kontor · Lag · Speiding · Kamp · Stats**

Dette følger samme informasjonsprinsipp som spillerlisten: oversikten brukes til å sammenligne mange, mens spillerprofilen brukes til å forstå én. Speiding introduserer ingen ny «Neste»-funksjon og konkurrerer ikke med `Forslag til neste steg`.

## Underflater

### Rekrutterbare

Viser spillere manageren allerede har tilgang til gjennom eksisterende History Go-opplåsinger eller en eksplisitt starttropp.

Listen viser bare data spillet faktisk har:

- navn
- naturlige og brukbare posisjoner
- foretrukne roller
- hvilket History Go-sted som ga tilgang
- tilgjengelig status

Det finnes ingen Overall-kolonne, lønn, alder eller kontraktsinformasjon som datasettet ikke eier.

### Andre klubber

Viser alle andre klubber i den eksisterende ligapyramiden. Egen klubb filtreres bort når save-state har `takeoverClubId`.

For hver klubb bruker visningen den eksisterende `listClubHeritagePlayers()`-motoren. Den kobler klubbens `homePlaceId` mot spillernes `sourcePlaceIds` og leser eventuell `clubStatus`.

Derfor er dette **HGs dokumenterte klubbtilknytninger / mulige historiske spillerpool – ikke en live stall og ikke en påstand om hvilke spillere klubben har under kontrakt i virkeligheten akkurat nå**.

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

Speiding lager ingen parallell spillerprofil.

## Motorgrenser

Speiding v1 er et presentasjons- og informasjonsarkitekturpass:

- ingen overgangsmotor
- ingen lønns- eller kontraktsmotor
- ingen transfer fee
- ingen ny fitmotor
- ingen ny spillerverdi
- ingen nye localStorage-nøkler
- ingen skriving til History Go-progresjonen

Rekrutterbare leses av de eksisterende `player_candidate`-opplåsingene. Andre klubber leses av `football_clubs.json`, `football_players.json` og `football-club-squad.js`.

## Responsive prinsipper

Desktop viser tette tabeller og klubb → spiller-drill-down. På mobil brytes tabellene til kompakte rader i stedet for en bred horisontal monster-tabell. Browser-vakten dekker 390 px, overflow, spillerprofil og WCAG 2 A/AA.
