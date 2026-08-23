# Arbeidsliste — klubbkatalogen

Skrevet 11.08.2026 og oppdatert 12.08.2026 etter ferdig P1. Tallene er målt mot dataene, ikke anslått, og hvert punkt sier hvordan det måles på nytt.

---

## P0 — GJORT (11.08.2026)

Begge vaktene er behandlet, og de svarte forskjellig på monotonitetsprøven:

- **Toppbøtter** var ikke bare feil satt, den var feil form. Tallet SYNKER med en malimport (44,30 → 42,73 ved 600 spillere), så terskelen har aldri kunnet fange feilen. Erstattet av en relativ vakt: posisjonsvektingen må bidra minst 1,5 poeng mindre klumping enn en flat grunnlinje. Begge endepunktene regnes ut hver kjøring, så den kan ikke bli utdatert. Verifisert isolert.
- **Unike styrke-sett** er monoton (43,19 → 37,02 → 27,40 → 19,72) og ble remålt: grensa fra 0,43 til **0,40**, 3,2 poeng klaring hver vei.

Se `docs/klubbvalg.md` for målingene. Regelen som nå har avgjort fire vakter: **sjekk om målet er monotont i feilen før grensa flyttes** — og hvis det ikke er det, skriv om eller legg ned.

## P1 — GJORT (12.08.2026, 22 av 22)

Konverteringen fjernet 1951 ukildede påstander. P1 bygget dekningen tilbake med source-only kildepass: hver eksklusive profil kontrolleres mot faktisk kilde, og bare DOKUMENTERT kan gi styrker.

| Kildestatus | Betyr | Resultat |
|---|---|---|
| DOKUMENTERT | en beskrivende individkilde bærer en konkret ferdighetsclaim | bare eksplisitt belagte styrker |
| DELVIS | karriere/rolle dokumentert, men ingen ferdighetsclaim | tom liste |
| THIN-SOURCE | ingen akseptert beskrivende individkilde funnet | tom liste |

De 18 arvene i siste P1-sett er frosset til **936 eksklusive profiler**. De 13 nye passene utgjør 701 og de fem tidligere 235. `scripts/audit-p1-source-claims.mjs` reproduserer nevneren direkte fra canonical `sourcePlaceIds` og faller ved drift.

| Arv | Eksklusive | Uten styrker | Dekning |
|---|---:|---:|---:|
| **Haugesund/Haugar/Djerv** | 87 | 50 | **43 %** |
| **Strømsgodset** | 84 | 63 | **25 %** |
| **Molde** | 54 | 41 | **24 %** |
| **Rosenborg** | 83 | 66 | **20 %** |
| **Vålerenga** | 66 | 53 | **20 %** |
| **Brann** | 47 | 42 | **11 %** |
| **Bodø/Glimt** | 47 | 43 | **9 %** |
| **KFUM** | 46 | 42 | **9 %** |
| **Viking** | 51 | 47 | **8 %** |
| **Lillestrøm** | 24 | 22 | **8 %** |
| **Fredrikstad** | 70 | 66 | **6 %** |
| **Tromsø** | 53 | 51 | **4 %** |
| **Sandefjord** | 41 | 40 | **2 %** |
| **Start** | 60 | 59 | **2 %** |
| **Moss** | 58 | 57 | **2 %** |
| **Lyn** | 55 | 54 | **2 %** |
| **Skeid** | 70 | 69 | **1 %** |
| **Aalesund** | 69 | 68 | **1 %** |
| **Odd** | 68 | 67 | **1 %** |
| Bryne | 41 | 41 | 0 % |
| Stabæk | 41 | 41 | 0 % |
| Kristiansund | 29 | 29 | 0 % |

De 13 nye passene ender på **17 DOKUMENTERT · 0 DELVIS · 684 THIN-SOURCE**. Samlet med de fem tidligere passene er P1-settet **45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE = 936**.

Katalogen som helhet har etter P1 et effektivt source-claim-lag med **612 av 2756 spillere (22,2 %) med dokumenterte styrker**, mot 592 (21,5 %) før denne siste P1-runden. Rå `football_players.json` beholdes som identitets- og medlemskatalog; P1-claimene anvendes før attributtmotoren regner profiler.

Lav dekning er ikke gjeld i seg selv. Den viser at kildesjangeren ikke beskriver ferdigheter. P1 skal aldri øke prosenten ved å slutte fra posisjon, kamper, mål, trofeer, kapteinsbind eller klubbstatus.

**Måles med:**

```bash
node scripts/audit-p1-source-claims.mjs
npm run sim:player-attributes
```

Se `docs/P1_SOURCE_CLAIMS.md` for frosset nevner, Stabæk-identitetene, statuskontrakt og importformen.

---

## P2 — 16 klubber uten arv, alle i 2. divisjon

**Ferdig (2):**

| Klubb | Dokumentert | Spillbar | Historikkposter |
|---|---:|---:|---:|
| Pors | 63 | 16 | 47 |
| Brattvåg | 81 | 18 | 63 |

Begge følger samme grense: posisjon legges bare inn der kilden gir den, og banen åpner bare profilene som har den. Brattvåg-kilden har i tillegg kampantall per mann (546 ned til 143) — det belegger A-lagstilhørighet og ingenting mer, og vakten krever at ingen av de 79 nye profilene bærer styrke, arketype, rollepreferanse eller taktisk preferanse. Begge er låst av **én** felles vakt, `audit:club-heritage`: forventningene per klubb er én rad i tabellen øverst i skriptet, så neste klubb er en rad og ikke en ny fil, og en skjerpelse treffer alle samtidig. Se `docs/P2_PORS_SOURCE_PASS.md` og `docs/P2_BRATTVAG_SOURCE_PASS.md`.

**Avdeling 1 (8 gjenstår):** Eik Tønsberg · Vidar · Kvik Halden · Sandviken · Lysekloster · Sotra · Træff · Bjarg

Kildesporene for disse åtte er kartlagt i **`docs/P2_KILDELISTE_AVDELING1.md`** — hvilke sider som finnes per klubb, med URL, rangert etter forventet utbytte. Det dokumentet er et finneverktøy og ingen kilde: innholdet er websøk, og et søketreff er en parafrase av en side ingen har åpnet. Fire feller er allerede synlige derfra og bør avklares før import: **Eik** blander spillere og trenere i én liste, **Sandviken**s dokumenterte historie er i stor grad kvinnefotball, **Sotra** er en sammenslåing av tre forgjengerklubber fra 2009, og **Træff** deler bane med Molde FKs rekruttlag. To banenavn i katalogen stemmer trolig ikke: Bjarg («Bjarg kunstgress» mot Stavollen idrettspark) og Vidar («Midjord» mot Lassa idrettspark).

**Avdeling 2 (8):** Tromsdalen · Stjørdals-Blink · Rana · Junkeren · Lørenskog · Eidsvold Turn · Follo · Trygg/Lade

Ingen av dem er en blindvei i dag: alle 60 klubber har ligaprofil og spilles som motstandere med sin egen fotball, og `pending` holder dem bare ute av overtakelseslista. Nivå 3 har 12 overtakbare klubber av 28, og **avdeling 1 er fortsatt den tynneste flaten i spillet med 6 av 14**.

**Handling:** v2-kildefiler i samme form som de siste importene. Hver klubb trenger også en `placeId` (alle har `ground` uten), og importen lager stedet.

**Rekkefølge:** avdeling 1 først — den er tynnest.

---

## P3 — restpunkter fra de to auditene

- **Filrydding utenfor repoet.** Sperrelista i sluttauditen (gamle `*_utvidede_*`-filer, ASCII-duplikatet av Hønefoss, den ene av to Jerv-kopier, gamle `Notodden.md` og `Honefoss.md`). Ingenting av dette bor i repoet, men det avgjør hva som kan bli importert ved en feiltakelse.
- **Rolf Halvorsen** (Strømsgodset, 274 kamper) står utenfor katalogen fordi kilden gir ham «Uavklart historisk hovedposisjon». Han kommer inn den dagen en kilde plasserer ham. Samme gjelder Brynes 1928-lag (17 navn) og tre Moss-profiler.
- **Fellesnavn uten motsigelse — nå målt, og mye mindre enn antatt.** Klassen ble lenge omtalt som katalogens største uverifiserbare, uten at noen hadde tallfestet den. Målingen står nå i `audit:attributes` hver kjøring:

  | | Antall |
  |---|---:|
  | Profiler som står på mer enn én bane | 505 |
  | … med kjent karriere (`classSource: belagt`) | 421 |
  | … med dokumenterte styrker (kilde lest) | 33 |
  | … med distinkt navn (sjeldent etternavn eller tre ledd) | 41 |
  | **Restklasse: koblet på navnet alene** | **10** |

  De ti er navngitt i skriptets utdata. Tallet **rapporteres, det er ingen grense**: det stiger både av en feilkobling og av at en ny arv deler en spiller med en gammel, så en terskel ville felt ærlig vekst like ofte som feil — samme fella profil-unikheten gikk i.

  Det som *kan* felle er den direkte koherenstesten, og den er ny: **ingen profil kan være keeper i én arv og utespiller i en annen** (`sim:player-attributes`). Den fant seks profiler ved innføring — fire keepere med CM eller CB blant `usablePositions` og to utespillere med GK, fire av dem fra én import. Ingen av dem hadde en kilde. Det var ikke kosmetisk: `usablePositions` gir positionFit **78**, altså «passer fint», så katalogen påsto at en navngitt keeper var en brukbar midtbanespiller og motoren ville stilt ham der **uten å flagge misbruk**. Alle seks er ryddet, og en keeper som tvinges ut på banen går nå gjennom misbruksveien og blir forklart der.

---

## Slik måles status

```bash
node scripts/audit-p1-source-claims.mjs
npm run sim:player-attributes
npm run sim:club-squad
node scripts/sync-club-affiliations.mjs
```

`modellerteArver.arver` skal fortsatt være **0**. Går den opp, er en arv fylt med modellerte felt igjen, og gjelden er tilbake.
