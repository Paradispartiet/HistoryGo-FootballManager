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

**Ferdig (16 av 16 påbegynt — 14 landet, 2 står igjen):**

| Klubb | Dokumentert | Spillbar | Historikkposter |
|---|---:|---:|---:|
| Brattvåg | 93 | 30 | 63 |
| Pors | 89 | 42 | 47 |
| Stjørdals-Blink | 78 | 68 | 10 |
| Lørenskog | 58 | 54 | 4 |
| Kvik Halden | 56 | 38 | 18 |
| Eidsvold Turn | 54 | 52 | 2 |
| Follo | 35 | 35 | 0 |
| Bjarg | 32 | 30 | 2 |
| Sandviken | 31 | 31 | 0 |
| Rana | 30 | 30 | 0 |
| Junkeren | 27 | 27 | 0 |
| Lysekloster | 27 | 27 | 0 |
| Trygg/Lade | 26 | 26 | 0 |
| Vidar | 26 | 26 | 0 |
| Eik Tønsberg | 25 | 25 | 0 |
| Træff | 23 | 23 | 0 |

Og den syttende, som passet før dette ikke kunne lande:

| Klubb | Dokumentert | Spillbar | Historikkposter |
|---|---:|---:|---:|
| **Tromsdalen** | 79 | 72 | 7 |

**Gjenstår: ingen.** Sotra ble landet 26.08.2026 på 15 spillbare — nøyaktig grensa. Se avsnittet nederst.

**2. divisjon har arv i alle 28 klubber**, mot 12 før dette arbeidet. Hele katalogen står på **60 av 60 overtakbare**, og ingen klubb er `pending`.

Alle fjorten følger samme grense: posisjon legges bare inn der kilden gir den, og banen åpner bare profilene som har den — enten posisjonen er presis eller en lagdel. Brattvåg-kilden har i tillegg kampantall per mann (546 ned til 143) — det belegger A-lagstilhørighet og ingenting mer, og vakten krever at ingen av de 79 nye profilene bærer styrke, arketype, rollepreferanse eller taktisk preferanse. Alle fjorten er låst av **én** felles vakt, `audit:club-heritage`: forventningene per klubb er én rad i tabellen øverst i skriptet, så neste klubb er en rad og ikke en ny fil, og en skjerpelse treffer alle samtidig. Hver klubb har sitt eget kildepass, `docs/P2_<KLUBB>_SOURCE_PASS.md`.

**Avdeling 1 er ferdig: 13 av 14 klubber har arv (24.08.2026).** Bare Sotra står igjen, med 12 registrerte A-lagsspillere mot grensa på femten.

**Kilden som landet dem var ikke den vi lette etter.** Passet leste først klubbenes *redaksjonelle* kilder — historiesider, Wikipedia, SNL — og konkluderte med at ingen av de seks gjenstående kunne landes. Riktig målt, feil spørsmål. **NFFs egen lagside** (`fotball.no/fotballdata/lag/hjem/?fiksId=N`) fører troppen for hvert registrerte lag, server-rendret i HTML-en, gruppert under **Keeper · Forsvar · Midtbane · Angrep** — nøyaktig oppløsningen `positionGroup` bruker. Sju klubber sto `pending` på redaksjonelle kilder; seks landet på registeret.

De to kildetypene svarer på hver sin ting: **redaksjonelle kilder gir dybde** (Bjargs fire navn med sitat, Vidars 510 kamper og 289 mål, Kviks cupvinnerlag fra 1918), **registeret gir bredde** (tjue til tretti navn med lagdel, hver sesong). En klubb trenger femten spillbare. Redaksjonelle kilder ga det hos null av åtte; registeret hos sju av åtte.

**Lagvalget må gå gjennom ligatabellen**, ikke klubbens lagliste. Bjarg har 84 registrerte lag og Sotra 79, blandet A-lag, rekrutt og 7er. To av åtte fikk først feil tropp: Sandviken traff B-laget (10 spillere mot 32), og Eik traff breddeklubbens «Menn 1» i stedet for «871 Menn Senior A».

**Identitetsvakten avgjorde tre par mot importen.** `audit:attributes` flagget seks nær-duplikate navn. To var samme mann og ble krysskoblet: Bjargs Rolf Birger Pedersen er Branns «Pesen» (kilden sier «tidligere Brannspiller»), og Træffs Vegard Valgermo Forren er Moldes Vegard Forren (Wikipedia: «spillende assistenttrener for Træff»). Fire er **utelatt** fordi paret er samme lagdel og ingen kilde skiller dem — å slå sammen to dokumenterte karrierer er den ene feilen som ikke kan angres, og å påstå at de er to menn er like ubelagt. Utelatelse påstår ingenting.

Hele målingen, med lærdommen om hvorfor første konklusjon var feil, står i `docs/P2_AVDELING1_MALING.md`.

**To banenavn ble rettet underveis, og Eik-spørsmålet er besvart.** Træff sto som «Molde idrettspark», som er **naboanlegget** — banen heter **Reknesbanen** og deles med Molde 2. Og Eik Tønsberg, som sto uttrykkelig åpen fordi `homePlaceId` er permanent, er avgjort mot kilden: **Tønsberg gressbane**, kapasitet 5 600, ifølge både klubbartikkelens infoboks og banens egen artikkel. Delingen med Tønsberg FK er bekreftet, ikke bortforklart.

**Avdeling 2 er ferdig: 7 av 8 landet (24.08.2026).** Samme kilde og samme form som avdeling 1 — NFFs lagside, med laget identifisert mot tabellen for avdeling 2. Bare Tromsdalen står igjen, med 9 registrerte spillere og ingen registrert keeper, som tyder på ufullstendig registrering snarere enn tom klubb. Se `docs/P2_AVDELING2_SOURCE_PASS.md`.

~~**De fire redaksjonelle sporene kildelista pekte på er ikke lest, og var ikke nødvendige.**~~ **LEST 26.08.2026 — og de ga ikke dybden heller.** Eidsvold Turns adelskalender, Stjørdals-Blinks klubbarkiv, Trygg/Lades historikkside og Romerikes Blads «Klubblegende»-serie oppgir ikke posisjon; RBs bildetekst er transkribert med feil, og de ti «legendene» ligger i video. Ingen av navnene er importert. Dybden kom fra Wikipedia-kategoriene i stedet — se avsnittet under.

**Sammenslåingene er ikke løst, bare ikke utløst.** Stjørdals-Blink (1956), Trygg/Lade (1986), Rana (2017) og Follo (paraply for fem lag fra 2000) har alle flere forgjengere, og kilden må si hvilken enhet en spiller representerte. En dagens tropp representerer dagens klubb uten tvetydighet, så spørsmålet er ikke stilt her. Det slår inn i det øyeblikket noen importerer historiske navn.

**Fire banenavn var gale og er rettet**, etter samme mønster som i avdeling 1: Tromsdalen «Tromsdalen kunstgress» → **TUIL Arena**, Lørenskog «Lørenskog stadion» → **Rolvsrud stadion** (begge generatorrester — klubbnavnet med «stadion»/«kunstgress» påhengt), Junkeren «Bodø Spektrum kunstgress» → **Nordlandshallen** (feil anlegg i samme by), og Stjørdals-Blink «Øverlands Minde» → **Sandskogan stadion** (klubben forlot Øverlands Minde i 2012 og Sandskogan har vært hjemmebane siden 2020; ført sponsorfritt). Ligaprofilene er kontrollert og ingen måtte rettes — de henter navnet fra klubben, ikke fra banen. Tre tier-avvik (Junkeren, Lørenskog, Trygg/Lade oppgis i 3. divisjon) er **ikke** rørt, av samme grunn som Vidar.

Ingen av dem er en blindvei i dag: alle 60 klubber har ligaprofil og spilles som motstandere med sin egen fotball, og `pending` holder dem bare ute av overtakelseslista. Nivå 3 har 12 overtakbare klubber av 28, og **avdeling 1 er fortsatt den tynneste flaten i spillet med 6 av 14**.

~~**Handling:** v2-kildefiler … **Rekkefølge:** avdeling 1 først — den er tynnest. **Neste klubb er Kvik Halden.**~~ **UTFØRT 24.08.2026 — alle seksten er importert.** Rekkefølgen holdt: Kvik Halden ble tatt nest, og forutsigelsen om den slo til på begge halvdeler — meritter fra 1918 ga navn, og krysskoblingsrisikoen mot Brann og Odd var reell. Det som ikke sto i planen var at redaksjonelle kilder skulle vise seg utilstrekkelige for fjorten av dem. Se avsnittet over.

**Formen er mekanisert (24.08.2026).** `scripts/import-club-heritage.mjs` leser en kildefil et menneske har fylt ut med kilden i hånd, og gjør oversettelsen til canonical form: profiler, banens unlocks, klubbraden, krysskoblinger og den ferdige `ARVER`-raden. Den flytter ingen grense — den stopper i stedet for å gjette, på ukjent posisjon, GK sammen med utespillerposisjon, styrker satt i råfila, et navn som finnes fra før uten at kildefila sier om det er samme mann, manglende epoke eller manglende kilde. `npm run audit:import-club-heritage` fjerner Pors og Brattvåg fra katalogen i minnet og krever at importen gjenskaper begge felt for felt, og at hvert av de tjue avslagene slår til. Se `docs/P2_IMPORT_V1.md`.

**Reproduksjonen fant to ting som sto i katalogen fra før.** Rekkefølgen i `clubAffiliations` eies av `sync-club-affiliations.mjs` (alfabetisk på `clubId`, kjørt i CI som drift-sjekk), så en krysskobling lagt bakerst ville felt en helt annen vakt ved neste kjøring; importen sorterer nå. Og **ti av Pors' elleve profiler med kildebelagt posisjon bærer historikkpostens advarsel om at posisjonen ikke er kildebelagt** — feltet motsier `naturalPositions`, som både banen og `spillbar: 16` behandler som belagt. Brattvåg har null slike. Hvilken av de to halvdelene som er feil kan bare avgjøres mot Pors-kilden, så det er ikke rettet; tallet er festet i vakten som `ordlydsavvik: 10` og kan verken vokse eller krympe stille.

~~**Én ting krever en avgjørelse før import, ikke etterpå:** Eik Tønsbergs bane.~~ **AVGJORT 24.08.2026 mot kilden — Tønsberg gressbane. Se over.** Den opprinnelige teksten: «Eik stadion» finnes ikke, og klubben har to kandidater med hvert sitt svar — **Eik Idrettsanlegg** er klubbens eget anlegg, mens **Tønsberg gressbane** (5 600) er der seniorlagene faktisk spiller, trolig delt med andre klubber. `homePlaceId` er permanent, så valget hører til importen med kilden i hånd. Den er derfor ikke rettet.

**Og en ledetråd som ikke lar seg automatisere:** fire av de seks gale banenavnene hadde formen «klubbnavn + stadion/kunstgress», som ser ut som en generatorsignatur man kan skrive en vakt på. Målt treffer mønsteret **16 av 60 klubber**, og minst tolv av dem er helt riktige virkelige navn (Brann Stadion, Fredrikstad stadion, Haugesund stadion …). En vakt ville gitt fjorten falske positive av seksten. Det som skiller er ikke navneformen, men om banen har et *eget lokalt navn* — Stavollen, TUIL Arena, Rolvsrud, Nordlandshallen, Lassa — og det kan bare avgjøres mot en kilde, én klubb om gangen. Mønsteret er en søkeliste, ikke en regel.

**De tre store arvene er supplert med 2026-troppen (24.08.2026).** Pors, Brattvåg
og Kvik Halden ble landet på klubbhistorikk og hadde derfor mange navn og få
spillbare. NFFs lagside ga dem dagens tropp, ført inn med den nye
`--suppler`-modusen:

| Klubb | Dokumentert | Spillbar | Tilført | Gjensyn |
|---|---:|---:|---:|---:|
| Pors | 63 → **89** | 16 → **42** | 26 | 0 |
| Brattvåg | 81 → **93** | 18 → **30** | 12 | 8 |
| Kvik Halden | 41 → **56** | 23 → **38** | 15 | 6 |

Historikkpostene står stille i alle tre — en supplering legger til, den skriver
ikke om. Modusen speilvender tre av importens regler (en supplering *krever* at
klubben står `ready`, og hopper over navn som alt står i arven), og
`audit:import-club-heritage` måler speilvendingen mot ekte katalogdata ved å
rekonstruere Brattvåg som historien faktisk gikk: én vanlig import, så én
supplering.

**To dubletter ble stoppet av en regel som ikke fantes.** Registeret skriver
`Iver Krogh Hagen` og `John Ruud Norvik` der klubbhistorikken skrev `Iver Hagen`
og `John Norvik`. Gjensynssjekken sammenlignet eksakte navn og laget begge som
nye profiler. Skriptet stopper nå på navnepar som skiller seg med nøyaktig ett
ledd i midten, med begge navnene i meldingen.

**Brattvåg er den første arven med to `eraSource`** — `utledet` fra en udatert
klubbhistorikk og `belagt` fra det daterte registeret. `audit:club-heritage`
godtar derfor en liste per arv i stedet for én verdi.

**Dybdepasset: Wikipedia ga sju klubber en fortid (26.08.2026).** De fjorten
registerklubbene hadde dagens tropp og ingenting bak den. Kildelista pekte på
fire redaksjonelle spor for å rette det; alle fire er lest, og **ingen av
navnene deres er importert** — de oppgir ikke posisjon, Romerikes Blads
bildetekst er transkribert med feil, og de ti «legendene» ligger i video.

Dybden lå i **no.wikipedias klubbkategorier**: én kategori per klubb, og hver
artikkel har posisjon i infoboksen og en datert karrieretabell. 326 artikler
lest enkeltvis, og bare de som har klubben i sin egen SENIORkarriere tatt med.

| Klubb | Dokumentert | Spillbar | Tilført |
|---|---:|---:|---:|
| **Tromsdalen** | 0 → **79** | 0 → **72** | 79 |
| Stjørdals-Blink | 24 → **78** | 24 → **68** | 54 |
| Lørenskog | 24 → **58** | 24 → **54** | 34 |
| Eidsvold Turn | 21 → **54** | 21 → **52** | 33 |
| Lysekloster | 16 → **27** | 16 → **27** | 11 |
| Rana | 28 → **30** | 28 → **30** | 2 |
| Trygg/Lade | 25 → **26** | 25 → **26** | 1 |

**Tromsdalen var den andre klubben passet før dette ikke kunne lande.** Med 72
spillbare er den `ready`, og `tuil_arena` er banen.

**Kategorien er ikke kilden — artikkelen er**, og de tre feilene den gjør er
verdt å huske. Den plasserer folk som aldri spilte der (Lørenskog IFs egen
artikkel fører Henning Berg blant «kjente spillere»; Bergs artikkel sier at han
spilte i KFUM fra lilleputt). Den skiller ikke herrelaget fra kvinnelaget
(`IL Sandviken` er på Wikipedia nesten utelukkende kvinnelaget som ble Branns i
2022 — 31 av 32 treff, **klubben er derfor utelatt fra passet i sin helhet**).
Og den tar med ungdomsspillere (fem av Trygg/Lades sju).

**Passet fant tre hull i importverktøyet.** En krysskobling til en mann som alt
sto i arven ble talt to ganger og ga duplikat `clubAffiliations` (åtte
profiler). Mellomnavn-sjekken fra Brattvåg så bare i arven, ikke i katalogen,
og ville laget 13 duplikate mennesker. Og Wikipedias titteltvetydiggjørere
(«Elias Solberg (f. 2004)») ble ført som en del av navnet, slik at
eksaktnavn-sjekken ikke så at mannen alt sto der (sju navn). Alle tre er rettet
i skriptet, ikke bare i dataene.

**90 av 95 navnekollisjoner ble avgjort av kilden selv** — artikkelens
seniorklubber mot katalogprofilens klubbtilknytninger. John Carew er
Lørenskogs, Svein Bakke og Stian Ringstad er Eidsvold Turns. Fem er **utelatt**
fordi ingen felles klubb finnes og posisjonen, der den er kjent, er samme
lagdel. Hele passet står i `docs/P2_WIKIPEDIA_DYBDEPASS.md`.

**Sotra, den siste (26.08.2026).** Klubben sto igjen etter både registerpasset
og Wikipedia-dybdepasset, med 12 registrerte mot grensa på femten.

**Wikipedia har to kategorier som ser ut som klubbens, og ingen av dem er det.**
`Fotballspillere for Nest-Sotra` (61 artikler) og `Fotballspillere for Øygarden
FK` (35) tilhører to andre juridiske enheter: Sotra Sportsklubb ble til i 2009
av Foldnes IL, Brattholmen IL og IL Øygard (1945); Nest-Sotra ble stiftet i
1968 og fortsatte som breddeklubb; Øygarden FK overtok Nest-Sotras OBOS-lisens
og gikk konkurs i 2022. Å importere de 96 hadde vært den største enkeltfeilen i
hele P2-arbeidet, og det er nøyaktig sammenslåingsfellen listen over advarer mot.

Klubbartikkelens «Kjente utøvere» ga tre navn — Zachariassen, Skålevik og Dang,
alle med Sotra i seniorkarrieren og alle datert etter 2009. Det fjerde, **Knut
Tørum**, nevner ikke Sotra i sin egen artikkel; samme feil som Lørenskog IFs
liste gjorde med Henning Berg.

**De to siste ble avgjort av NFFs PERSONSIDE**, som er den beste
navnebror-testen vi har: den fører hver sesong en mann har vært registrert, med
klubb, også ungdomsår og andrelag. Importen stoppet på Håvard Arefjord Foldnes
og Erlend Hellevik Larsen, som begge kolliderte med katalogens Åsane-profiler —
og de profilene er `utledet` med posisjonssettet `["CB","DM"]`, som **19 av
Åsanes 76 profiler deler**. Det er en mal, ikke en lest posisjon, så posisjonen
kunne ikke skille noen fra noen. Personsiden viste at begge har Åsane i
karrieren. Samme menn, krysskoblinger, og det tok Sotra fra 13 til 15.

Foldnes nesten gikk galt: første gjennomlesning fant Brann, Fyllingsdalen og
Sotra og *ikke* Åsane — det står **`Åsane 2`**, andrelaget, som er samme klubb.
`parseCareer` i `scripts/nff-squad.mjs` gjør siden til et verktøy, og
`audit:nff-squad` låser den mot nettopp den raden.

To vakter måtte skrives om, ikke slettes: «det finnes pending-klubber» målte
både at katalogen hadde uferdig arbeid og at motorens unavailable-vei virket.
Bare den andre er verdt å beholde, og den måles nå mot en konstruert klubb.

**`--skjerp` er målt og ikke bygget.** En supplering kan legge til menn, men
ikke skjerpe posisjonen til en som alt står der. Målingen mot alle 326 hentede
artikler fant **sju** profiler en kilde kunne skjerpet — og alle sju er de
tvetydige tolagdels-verdiene («Forsvar/Midtbane», «Back, midtbanespiller») som
skjemaet ikke kan uttrykke og importen med vilje avviser. Modusen ville hatt
null arbeid å gjøre.

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
npm run audit:nff-squad
node scripts/sync-club-affiliations.mjs
```

Troppene hentes med `node scripts/nff-squad.mjs --lag <fiksId>`; lagene finnes med `--turnering <fiksId>`. Se `docs/P2_IMPORT_V1.md`.

`modellerteArver.arver` skal fortsatt være **0**. Går den opp, er en arv fylt med modellerte felt igjen, og gjelden er tilbake.
