# Lillestrøm: avsluttende kilderevisjon av tre delvis dokumenterte P1-profiler (21.10.2026)

## Omfang og prinsipp

`main` har 24 eksklusive Lillestrøm-profiler: **21 med individuelt kildebelagte styrker**, **3 DELVIS** og **0 THIN-SOURCE**. De tre DELVIS-profilene er Emille Baron (`emille_baron`), Ole Dyrstad (`ole_dyrstad`) og André Krogsæter (`andre_krogsaeter`). Dette er verifisert ved å sammenholde `data/football_players.json` med individuelle poster i `src/football-player-source-claims-p1.js` på `main`.

Ny styrke krever individuell, kvalitativ ferdighetsbeskrivelse som kan knyttes til spilleren; posisjon, kapteinsbind, generelle superlativer, én god kamp og rene scorings-/kampstatistikker er ikke alene nok. Ingen tallratinger eller generiske spillerstiler konstrueres for å oppnå 24/24.

## Kilder og beslutning

| Spiller | Kontrollerte kilder | Grense for dokumentasjon |
| --- | --- | --- |
| Emille Baron | [Dagbladet 22.03.2023](https://www.dagbladet.no/sport/tragisk-beskjed-sjokkert/78815002) gjengir retrospektive vurderinger fra Torgeir Bjarmann, Espen Søgård og trener Arne Erlandsen. Bjarmann beskriver Baron som en «superatlet», men ingen særskilt keeperspesifikk ferdighet. [Dagbladet 10.07.2000](https://www.dagbladet.no/sport/horribelt/65618727) gjengir Erlandsens samtidige vurdering av ham som under utvikling og stabil. | Dokumentasjon for utmerket og atletisk keeper, **ikke** entydig for `reflexes`, `shot_stopping`, `agility`, `command_of_area` eller `distribution` som individuelt fremhevede styrker. Behold DELVIS. |
| Ole Dyrstad | [LSKs intervju fra 2019](https://www.lsk.no/nyheter/4402-billetter-solgt-dyrstad-reiser-140-mil-for-a-se-lsk-rbk): Dyrstad beskriver et kollektivt solid forsvar i 1989 og sier at midtstopper var hans beste posisjon, etter tidligere spill som back. [LSK 13.06.2022](https://www.lsk.no/nyheter/lehne-og-dyrstad-kommer-vorspiel-pa-lillestrom-torv-for-klassikeren-mot-rbk) bekrefter at han var lagkaptein i 1989. | Individuell posisjon støttes, og katalogens `CB` (med `RB` brukbar) er konsistent. Lagets defensive resultater og kapteinsbind er **ikke** belegg for `duels`, `tackling`, `positioning`, `leadership` eller andre token. Behold DELVIS. |
| André Krogsæter | [LSK 12.08.2025](https://www.lsk.no/nyheter/statistikk-fra-fagerli-28-3-pa-rolvsrud), [LSK 2017](https://www.lsk.no/nyheter/cupfinalen-1985) og [LSKs kampstatistikk 2025](https://www.lsk.no/nyheter/statistikk-fra-fagerli-fire-strake-seire-mot-kongsvinger) dokumenterer en oppsiktsvekkende NM-målproduksjon i 1985. [Aftenpostens samtidige kampreferat 02.05.1983](https://img6.custompublish.com/getfile.php/1999983.1276.recyxxxsdd/Aftenposten%2B02.05.1983.pdf?return=www.sjaanjo.no) beskriver et enkelt elegant gjennombrudd. | Mangler en generaliserbar kvalitativ vurdering av `finishing`, `dribbling`, `movement` eller `acceleration`. Måltall og én beskrevet enkeltaksjon er ikke tilstrekkelig. Behold DELVIS. |

## Beslutning

**Ingen nye ferdighetstoken legges til. Lillestrøm står på 21/24 (87,5 %), 3 DELVIS.**

Dette er et avsluttet søk i de lett tilgjengelige åpne kildene, ikke en påstand om at slikt belegg ikke finnes i papirarkiv, biografier eller fullstendige kampreferater. Nye konkrete faglige vurderinger kan senere brukes til en presis profiloppgradering. Eksisterende spillernavn, ID-er, posisjoner, kilder, motor, taktisk modell og runtime blir ikke endret av denne kilderevisjonen.

*Merk:* Vurderingen gjelder bare `P1`-overleggets individuelt dokumenterte styrker. Råkatalogens generiske `archetypes` er ikke dokumenterte ferdighetstoken.
