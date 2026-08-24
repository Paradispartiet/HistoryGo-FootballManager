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

**Ferdig (3):**

| Klubb | Dokumentert | Spillbar | Historikkposter |
|---|---:|---:|---:|
| Pors | 63 | 16 | 47 |
| Brattvåg | 81 | 18 | 63 |
| Kvik Halden | 41 | 23 | 18 |

Alle tre følger samme grense: posisjon legges bare inn der kilden gir den, og banen åpner bare profilene som har den — enten posisjonen er presis eller en lagdel. Brattvåg-kilden har i tillegg kampantall per mann (546 ned til 143) — det belegger A-lagstilhørighet og ingenting mer, og vakten krever at ingen av de 79 nye profilene bærer styrke, arketype, rollepreferanse eller taktisk preferanse. Alle tre er låst av **én** felles vakt, `audit:club-heritage`: forventningene per klubb er én rad i tabellen øverst i skriptet, så neste klubb er en rad og ikke en ny fil, og en skjerpelse treffer alle samtidig. Se `docs/P2_PORS_SOURCE_PASS.md`, `docs/P2_BRATTVAG_SOURCE_PASS.md` og `docs/P2_KVIK_HALDEN_SOURCE_PASS.md`.

**Avdeling 1 (6 gjenstår):** Eik Tønsberg · Vidar · Sandviken · Lysekloster · Sotra · Træff

**Kvik Halden er importert (24.08.2026), og avgjørelsen den stoppet på er tatt.** Kilden ga 44 A-lagsnavn — tjue historiske fra klubbens egen årstallsliste og Wikipedias bildetekst av cupvinnerlaget 1918, og 24 fra A-lagstroppen 2023 — men bare 9 med presis posisjon, og det kreves 15 spillbare. Spørsmålet var nytt: **teller en kilde som sier «forsvar» som posisjon?**

**Svaret ble ja, men oppløsningen skal stå i dataene.** Lagdelen skrives til `usablePositions` og ikke til `naturalPositions`, fordi `calculatePositionFit` gir 96 for en naturlig posisjon og 78 for en brukbar — fire naturlige ville påstått at mannen passer *godt* som både midtstopper og begge backer. Profilen merkes `positionSource: "gruppe"`, og `audit:import-club-heritage` håndhever begge veier på hele katalogen: ingen profil kan bære merket uten å ha en hel lagdel i `usablePositions`, og ingen kan bære en hel lagdel uten merket. Keeper er ikke en lagdel — «keeper» og `GK` er samme oppløsning. Resultatet ble **41 dokumenterte, 23 spillbare, 18 historikkposter**, og formen gjelder nå de seks gjenstående i avdeling 1 og de åtte i avdeling 2. Se `docs/P2_IMPORT_V1.md` og `docs/P2_KVIK_HALDEN_SOURCE_PASS.md`.

**Passet fant også to ting kildelista ikke hadde flagget.** Kvik Halden er en **sammenslåing fra 1997** (FK Kvik + Halden Fotballklubb), og cupgullet i 1918 ble tatt av FK Kvik — samme problem som Sotra, som listen flagget. Og navnekollisjonene traff: av seks historiske navn med Wikipedia-artikkel var **tre en annen person** — en skøyteløper, en komponist og en dansk ordfører. Fem navn fantes i katalogen fra før, og fire av dem hadde en posisjonsmotsigelse mellom troppen og katalogen. **To er koblet** (Raymond Kvisvik og Fabian Stensrud Ness, begge bekreftet av sin egen individkilde) og **tre er utelatt** til klubbens egen troppsside kan avgjøre om det er samme mann: Marius Ophaug, Mathias Engebretsen (`GK` i katalogen, midtbane i troppen) og Henrik Hagen. Klubben når 23 spillbare uten dem, så avventingen koster ingenting nå.

**Bjarg er lest ut og gir ikke en pool (24.08.2026).** Kilden er gjennomgått i sin helhet — alle 66 artiklene på `bjargsinhistorie.no`, pluss Wikipedia, klubbsiden og forbundet — og bærer **fire A-lagsnavn, ett av dem med posisjon**: Frank Berentsen (midtstopper), Rolf Birger Pedersen (spillende trener 1973), Kjell Jensen og Stig Arve Vangsnes. En klubb trenger femten profiler med kildebelagt posisjon for å være overtakbar — grensa gjelder de spillbare, ikke de dokumenterte — og Bjarg har én. Klubben står derfor `pending`, og de fire er skrevet ned med sitat og årstall i `docs/P2_BJARG_SOURCE_PASS.md` så ingen leser de 66 artiklene på nytt.

**Og rangeringen i kildelista holdt ikke.** Bjarg sto først av åtte med «best strukturelle utsikter», fordi klubben som den eneste har et helt nettsted viet sin egen historie. Nettstedet viste seg å være årsrapporter for *hele* idrettslaget, der sjangeren er organisasjonsberetning: den navngir formenn, trenere, dommere og kretslagsuttak, og omtaler lagene kollektivt. Det er samme lærdom som P1 endte på — **sjangeren avgjør, ikke lengden** — og den gjelder de sju andre radene også. Rangeringen skal leses som en søkerekkefølge, ikke som en forventning. Banenavnet **Stavollen kunstgress** er derimot bekreftet mot klubbens egen kilde og Wikipedias infoboks, og står urørt.

Kildesporene for disse åtte er kartlagt i **`docs/P2_KILDELISTE_AVDELING1.md`** — hvilke sider som finnes per klubb, med URL, rangert etter forventet utbytte. Det dokumentet er et finneverktøy og ingen kilde: innholdet er websøk, og et søketreff er en parafrase av en side ingen har åpnet. Fire feller er allerede synlige derfra og bør avklares før import: **Eik** blander spillere og trenere i én liste, **Sandviken**s dokumenterte historie er i stor grad kvinnefotball, **Sotra** er en sammenslåing av tre forgjengerklubber fra 2009, og **Træff** deler bane med Molde FKs rekruttlag. To banenavn var gale og er rettet: Bjarg sto som «Bjarg kunstgress» (klubbnavnet med «kunstgress» påhengt) og heter **Stavollen kunstgress**; Vidar sto som «Midjord», som er **en annen klubbs bane** — Vidar holder til på **Lassa idrettspark**. Vidar-feilen hadde forplantet seg til ligaprofilen, der `styleName` het «Midjord-nærhet» og `tacticalSchool` «Bydelsklubb på Storhaug», altså feil bydel; begge er rettet. Divisjonen er derimot **ikke** rørt: `football_clubs.json` er et uttrykkelig 2026-øyeblikksbilde, og å flytte Vidar ut av avdeling 1 ville tømt en plass `audit:clubs` krever fjorten lag i — det er en designavgjørelse om pyramiden, ikke en korreksjon.

**Avdeling 2 (8):** Tromsdalen · Stjørdals-Blink · Rana · Junkeren · Lørenskog · Eidsvold Turn · Follo · Trygg/Lade

Kartlagt i **`docs/P2_KILDELISTE_AVDELING2.md`**, samme form og samme forbehold. Beste kilder her: **Eidsvold Turn har egen adelskalender** (Brattvåg-formen, navn med kampantall), **Stjørdals-Blink har klubbarkiv**, **Trygg/Lade har historikkside**, og **Lørenskog** dekkes av Romerikes Blads «Klubblegende»-serie — portrettsjangeren som faktisk gir dokumenterte styrker. Tre klubber er sammenslåinger med flere forgjengere (Stjørdals-Blink 1956, Trygg/Lade 1986, Rana 2017) og Follo er en paraply for fem lag fra 2000, så kilden må si hvilken enhet en spiller representerte.

**Fire banenavn var gale og er rettet**, etter samme mønster som i avdeling 1: Tromsdalen «Tromsdalen kunstgress» → **TUIL Arena**, Lørenskog «Lørenskog stadion» → **Rolvsrud stadion** (begge generatorrester — klubbnavnet med «stadion»/«kunstgress» påhengt), Junkeren «Bodø Spektrum kunstgress» → **Nordlandshallen** (feil anlegg i samme by), og Stjørdals-Blink «Øverlands Minde» → **Sandskogan stadion** (klubben forlot Øverlands Minde i 2012 og Sandskogan har vært hjemmebane siden 2020; ført sponsorfritt). Ligaprofilene er kontrollert og ingen måtte rettes — de henter navnet fra klubben, ikke fra banen. Tre tier-avvik (Junkeren, Lørenskog, Trygg/Lade oppgis i 3. divisjon) er **ikke** rørt, av samme grunn som Vidar.

Ingen av dem er en blindvei i dag: alle 60 klubber har ligaprofil og spilles som motstandere med sin egen fotball, og `pending` holder dem bare ute av overtakelseslista. Nivå 3 har 12 overtakbare klubber av 28, og **avdeling 1 er fortsatt den tynneste flaten i spillet med 6 av 14**.

**Handling:** v2-kildefiler i samme form som de siste importene. Hver klubb trenger også en `placeId` (alle har `ground` uten), og importen lager stedet.

**Rekkefølge:** avdeling 1 først — den er tynnest. **Neste klubb er Kvik Halden**, ikke fordi den står nest øverst i rangeringen, men fordi meritter som cupmester 1918 og cupfinaler 1915 og 1922 pleier å bli skrevet om med navn. Bjarg viste at «har egen historieside» ikke er det samme som «omtaler enkeltspillere», og det er det siste som avgjør. Merk krysskoblingsrisikoen: Brann og Odd har alt arv i katalogen.

**Formen er mekanisert (24.08.2026).** `scripts/import-club-heritage.mjs` leser en kildefil et menneske har fylt ut med kilden i hånd, og gjør oversettelsen til canonical form: profiler, banens unlocks, klubbraden, krysskoblinger og den ferdige `ARVER`-raden. Den flytter ingen grense — den stopper i stedet for å gjette, på ukjent posisjon, GK sammen med utespillerposisjon, styrker satt i råfila, et navn som finnes fra før uten at kildefila sier om det er samme mann, manglende epoke eller manglende kilde. `npm run audit:import-club-heritage` fjerner Pors og Brattvåg fra katalogen i minnet og krever at importen gjenskaper begge felt for felt, og at hvert av de seksten avslagene slår til. Se `docs/P2_IMPORT_V1.md`.

**Reproduksjonen fant to ting som sto i katalogen fra før.** Rekkefølgen i `clubAffiliations` eies av `sync-club-affiliations.mjs` (alfabetisk på `clubId`, kjørt i CI som drift-sjekk), så en krysskobling lagt bakerst ville felt en helt annen vakt ved neste kjøring; importen sorterer nå. Og **ti av Pors' elleve profiler med kildebelagt posisjon bærer historikkpostens advarsel om at posisjonen ikke er kildebelagt** — feltet motsier `naturalPositions`, som både banen og `spillbar: 16` behandler som belagt. Brattvåg har null slike. Hvilken av de to halvdelene som er feil kan bare avgjøres mot Pors-kilden, så det er ikke rettet; tallet er festet i vakten som `ordlydsavvik: 10` og kan verken vokse eller krympe stille.

**Én ting krever en avgjørelse før import, ikke etterpå:** Eik Tønsbergs bane. «Eik stadion» finnes ikke, og klubben har to kandidater med hvert sitt svar — **Eik Idrettsanlegg** er klubbens eget anlegg, mens **Tønsberg gressbane** (5 600) er der seniorlagene faktisk spiller, trolig delt med andre klubber. `homePlaceId` er permanent, så valget hører til importen med kilden i hånd. Den er derfor ikke rettet.

**Og en ledetråd som ikke lar seg automatisere:** fire av de seks gale banenavnene hadde formen «klubbnavn + stadion/kunstgress», som ser ut som en generatorsignatur man kan skrive en vakt på. Målt treffer mønsteret **16 av 60 klubber**, og minst tolv av dem er helt riktige virkelige navn (Brann Stadion, Fredrikstad stadion, Haugesund stadion …). En vakt ville gitt fjorten falske positive av seksten. Det som skiller er ikke navneformen, men om banen har et *eget lokalt navn* — Stavollen, TUIL Arena, Rolvsrud, Nordlandshallen, Lassa — og det kan bare avgjøres mot en kilde, én klubb om gangen. Mønsteret er en søkeliste, ikke en regel.

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
npm run audit:club-heritage
npm run audit:import-club-heritage
node scripts/sync-club-affiliations.mjs
```

`modellerteArver.arver` skal fortsatt være **0**. Går den opp, er en arv fylt med modellerte felt igjen, og gjelden er tilbake.
