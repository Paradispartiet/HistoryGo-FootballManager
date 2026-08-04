# Klubbvalg

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Klubbvalget følger den samme regelen: **klubben avgjør ingen kamp.** Den setter
hvor du starter og hva styret måler deg mot — ikke hvordan spillerne dine gjør
det på banen. Det er fortsatt rollen, posisjonen, taktikken og relasjonene.

## To veier inn

Onboardingens klubbsteg har to faner:

- **Lag din egen** — skriv et navn. Ingen historie, ingen arvet stil, og et
  tålmodig styre som venter øvre halvdel første sesong. Du starter i Eliteserien.
- **Ta over en klubb** — velg blant alle **60** klubbene i pyramiden, søkbart på
  navn, by og divisjon.

Lista er **data** (`data/football_clubs.json` + spillestilprofilene) og bygges av
`listSelectableClubs()`. Ingen klubb står i markupen — `sim:club-selection`
avviser det eksplisitt.

## Hva du arver — og hva du ikke arver

Tar du over en klubb, arver du **tre** ting:

1. **Identitet** — navn, bane, by.
2. **Nivå** — der klubben faktisk står. Tar du over Skeid, begynner du i
   2. divisjon avdeling 2. Det er ikke en straff, det er hvor klubben er.
3. **Tradisjon og forventning** — klubbens spillestil blir din, og styret måler
   deg mot den.

Du arver **ikke troppen**. Spillerne kommer fortsatt fra samlingen din — ellers
ville klubbvalget omgått hele kjernesløyfen (Sted → Person → Ekspertise →
Trening → Badge → Lagklasse). Det står i oppsummeringen **før** du velger, og
vakten krever at det står der.

## Forventningen er der det koster

Styrets krav første sesong kommer fra klubbens **standing i sin egen divisjon** —
ikke fra spillerne dine, og ikke fra et vanskelighetsvalg.

| Klubb | Nivå | Styrets krav | Mål |
|---|---|---|---|
| Bodø/Glimt | Eliteserien | Seriegull | topp 1 |
| Rosenborg | Eliteserien | Topp 3 | topp 3 |
| KFUM Oslo | Eliteserien | Sikker plass | topp 13 |
| Odd | OBOS-ligaen | Opprykk | topp 3 |
| Skeid | 2. divisjon | Opprykk | topp 2 |
| Bjarg | 2. divisjon | Sikker plass | topp 11 |
| *Egen klubb* | Eliteserien | *ingen historie* | topp 8 |

Det er den ekte vanskelighetsdialen: å ta over Bodø/Glimt er hardere enn å lage
sin egen klubb, fordi styret ikke godtar en mellomsesong. Fra **sesong to** måles
du mot deg selv igjen — klubbforventningen er et startpunkt, ikke et tak.

## Vaktene

`sim:club-selection` (262 sjekker):

- alle 60 klubbene kan velges, gruppert etter nivå, sterkeste først
- ingen klubb er hardkodet i `index.html`
- forventningene **sprer seg** (6 ulike krav, 3 pressnivåer) — en forventning som
  er lik for alle er ingen forventning, samme måling som styleTraits-spredningen
- på hvert nivå har den sterkeste klubben hardere krav enn den svakeste
- målet får plass i tabellen for hver eneste klubb
- egen klubb beholder det tålmodige målet; klubbmålet er hardere/mykere der det skal
- **nivået måles, ikke leses**: `resolveStartTier()` ligger i motoren nettopp
  fordi den lå i `app.js` først, der en vakt bare kunne lete etter et
  funksjonsnavn — og en slik vakt består selv om nivået ignoreres. Bitetesten
  gikk gjennom på første forsøk, og det var vakten som var for svak, ikke koden
  som var riktig
- oppsummeringen sier hva du arver, og at troppen ikke følger med

`audit:dead-ends` stadium 28: klubblista har tak-høyde og scroller selv, og
onboardingflata scroller. Målt i et 930px vindu havnet «Start klubben» på y=1255
da lista og oppsummeringen kom til. Kortet scroller, så det er ingen blindvei —
men uten tak-høyden ville 60 klubber dyttet knappen vilkårlig langt ned, og
valget ville blitt en flate du ikke kommer videre fra.

## Ikke gjort

**Klubbens historiske tropp.** Å ta over Rosenborg gir deg klubben, ikke Eggens
lag. Det er en egen og mye større datajobb: ~15 ekte fotballspillere per klubb,
hver med posisjoner, roller og styrker — og svakhetsmotoren utleder svake sider
fra nettopp de feltene, med regelen om at den *aldri* skal finne på påstander om
en ekte spiller.

## Tradisjonen måles nå

Klubbvalget lovet noe spillet ikke holdt. Onboardingen sa «Tradisjon: Godfoten.
Styret venter at du spiller klubbens fotball» — og `inheritedStyleName` ble satt
og **aldri lest av noe**. Et løfte uten dekning, og ingenting feilet.

`src/football-club-tradition.js` måler det. Både klubbens tradisjon og hver av de
46 formasjonene er allerede beskrevet på **de samme ni aksene**
(`parameterProfile`: presshøyde, forsvarslinje, bredde, ballbesittelse, tempo,
omstilling, restforsvar, pressform, risiko). Klubbens akser utledes av
`styleTraits` og `matchupStyles` som allerede fantes — ingenting er funnet på.

Treff på en akse = 2 poeng, nabo = 1, motsatt ende = 0.

### Tersiler, ikke faste grenser

Aksene har vidt forskjellige spenn: `pressIntensity` går 25–82, `intensity` går
52–85. Én fast grense (45/60) ville dyttet `tempo` til **54 av 60 klubber i «høy»**
— målt, ikke antatt. Terskelverdiene er derfor **tersiler regnet ut av korpuset**.
Vakten krever at hver akse bruker alle tre bøttene og at ingen bøtte tar mer enn
70 %.

### Dommen må kunne oppnås

Første utgave målte mot 100 %. Målt mot de 46 formasjonene kunne da **44 av 60
klubber aldri nå toppdommen**, uansett hva manageren valgte — biblioteket har
ingen perfekt kopi av hver klubbs tradisjon, og manageren ble straffet for det.

En dom ingen kan få er ingen dom. Nå måles den mot klubbens **oppnåelige spenn**:
100 % betyr «du valgte det beste systemet denne klubben faktisk kan spilles med».
Vakten krever at hver klubb kan nå både topp- og bunndommen.

| Klubb + system | Dom |
|---|---|
| Godfoten + Possession 4-3-3 | Klubbens fotball (100 %) |
| Godfoten + Catenaccio 5-3-2 | Fremmed for klubben (0 %) |
| Åråsen-kynisme + Classic 4-4-2 | Klubbens fotball (100 %) |

Kontrollert som fotball: ingen ballbesittende klubb får en lav blokk som sitt
beste system, og ingen lavblokk-klubb får et høypressystem.

### Den rører aldri en kamp

Dette er en **styredom**, på linje med sesongdommen — den legger én linje til
styrets begrunnelse og ingenting mer. Den leser ikke `overall`, ikke
`matchScore`, ikke `finalStrength`, og hver forklaring peker på et **systemvalg**:

> «forsvarslinje: klubben spiller «high», Catenaccio 5-3-2 gir «deep». Det er et
> systemvalg, ikke en spillersvakhet.»

Vakten krever at forklaringene aldri skylder på spillerne, og at sesongdommen er
**bit-identisk** for en egenopprettet klubb — den har ingen tradisjon å svikte.

`sim:club-tradition`: 1189 sjekker. Fem vakter bittestet, og bitetest 2
reproduserte nøyaktig feilen første utgave hadde.

## Klubbens spillere ligger på banen

Å ta over Rosenborg deler **ikke** ut Eggens lag. Du kan heller ikke plukke en
bestemt historisk utgave av klubben. Det du får, avhenger av én ting: **har du
vært på Lerkendal?**

| | Du får |
|---|---|
| **Har vært på banen** | Klubbens historiske spillere er dine å velge blant. Du plukker selv hvem du bygger laget rundt. |
| **Har ikke vært der** | En automatisk grunntropp, og klubbens spillere åpner seg når du besøker banen. |

Det er kjernesløyfen brukt **på** klubbovertakelsen i stedet for å omgå den —
samme form som landslagsmodus, der nasjonens grunntropp er bunnen og samlingen
er oppsiden.

Ingen ny gate er funnet opp: spillerne var allerede knyttet til steder gjennom
`sourcePlaceIds`, og `computeAvailability()` gatet dem allerede på besøkte
steder. Det som manglet var koblingen **klubb → bane** (`homePlaceId`) og en
grunntropp så et klubbvalg aldri blir en blindvei.

| Klubb | Bane | Historiske spillere |
|---|---|---:|
| Rosenborg | Lerkendal | 156 |
| Vålerenga | Intility Arena | 126 |
| Molde | Aker stadion | 89 |
| Tromsø | Romssa Arena | 81 |
| Brann | Brann Stadion | 75 |
| Viking | Lyse Arena | 70 |
| Lillestrøm | Åråsen | 56 |
| Sarpsborg 08 | Sarpsborg stadion | 32 |
| HamKam | Briskeby | 26 |
| Bodø/Glimt | Aspmyra stadion | 6 |
| Fredrikstad | Fredrikstad stadion | 4 |
| Stabæk | Nadderud | 3 |
| Start | Sparebanken Sør Arena | 2 |
| Aalesund | Color Line Stadion | 1 |
| Kristiansund, Sandefjord, KFUM | (bane, ingen navn ennå) | 0 |

**Alle 16 eliteserieklubbene har bane**, pluss Stabæk — 727 arveplasser fordelt
på 14 klubber. De 43 klubbene i OBOS og 2. divisjon har ikke bane, og profilen
sier det rett ut i stedet for å late som.

Summen er *plasser*, ikke personer: 74 spillere står på to eller tre baner fordi
de faktisk spilte begge steder, og teller derfor hos hver klubb.

Tabellen over er **vaktet mot dataene** (`sim:club-squad`): et tall som ikke
stemmer, en klubb som står to ganger, eller en klubb med spillere plassert i
null-raden, faller. Den vakten finnes fordi arvetabellen drev fra dataene tre
ganger — et redigeringsskript som avbrøt midtveis, en delvis redigering som ga
Rosenborg to rader, og HamKam som sto både med 26 spillere og som tom. Ingenting
feilet, for dokumentasjon leses ikke av noen vakt. Nå gjør den det.

### Vålerenga: 126 navn, og en mal i stedet for 126 håndskrevne varianter

Vålerenga-arven er den desidert største: 126 navn fra Henry «Tippen» Johansen og
Einar «Bruno» Larsens klubbrekord på 99 mål, gjennom gullalderen 1980–1984, til
akademiet som har solgt Sahraoui, Odin Thiago Holm og Jones El-Abdellaoui.

Profilene er **generert fra posisjon**, ikke skrevet én og én. Kilden oppgir
primærposisjon for hver eneste spiller, og det er den som styrer arketyper,
styrker, behov, roller og taktikkpreferanser. 126 håndskrevne varianter ville
vært falsk presisjon — og verre: de ville drevet fra posisjonen de skulle
beskrive. Det unike per spiller er posisjon, epoke, nasjon og nivå, som er
nøyaktig det kilden faktisk oppgir.

**Joshua King er bevisst utelatt.** Kilden sier at han spilte i ungdomsavdelingen
og aldri på A-laget. Å legge ham inn som arvespiller ville vært å påstå noe
kilden uttrykkelig avviser. Han hører hjemme i en egen akademikategori, og den
finnes ikke i datamodellen ennå.

Elleve spillere som allerede lå på andre baner ble **koblet på** i stedet for
kopiert: Ronny Johnsen, John Carew, Tore André Flo og Sander Berge fra Ullevaal,
Pål Jacobsen, Petter Belsvik, Marcus Pedersen, Jarl-André Storbæk og Aron Dønnum
fra Briskeby, Harmeet Singh fra Sarpsborg og Magne Hoseth fra Aker stadion.

### Lillestrøm: 56 navn, og en referansefeil vakten tok

LSK-arven dekker klubbens vei fra nivå tre til to seriegull og tre cupgull: Tom
Lund, som VG rangerte som **tidenes beste spiller i norsk klubbfotball**, gjennom
dobbeltlaget fra 1977 og gullaget i 1989 til Kippe, Bjarmann, Sundgot og Lehne
Olsen.

Ni navn lå allerede i katalogen og ble **koblet på**: Henning Berg og Ronny
Johnsen, John Arne Riise, Ståle Solbakken, Jan Åge Fjørtoft, André Bergdølmo,
Thomas Lehne Olsen, Arne Dokken og Geir Frigård. Seks fikk samtidig **nivået
rettet mot kilden** — Tom Lund sto på 88 og er hevet til 91, og Arne Dokken sto
som `utledet` 79 selv om kilden belegger ham som landslagsspiss.

Importen avdekket en referansefeil jeg selv innførte: spillerne fikk `araasen_
stadion` i `sourcePlaceIds`, men stedet fikk aldri spillerne i `unlocks`. Arven
ville da stått i klubblista uten å kunne samles — synlig, men ikke oppnåelig.
`sim:club-squad` sjekker begge retninger og tok den umiddelbart.

### Viking: 70 navn, fra Bronselaget til seriegullet i 2025

Viking-arven spenner videst i tid av alle: fra Reidar Kvammens 202 klubbmål og
OL-bronsen i 1936, gjennom fire strake seriegull 1972–75 og The Double i 1979,
til mesterlaget fra 2025.

62 nye navn. Fem lå allerede i katalogen og ble koblet på — Erik Thorstvedt,
Brede Hangeland, Martin Andresen, Thomas Pereira, Trond Egil Soltvedt og
Yann-Erik de Lanlay. Fem nivåer er rettet mot kilden, og tre av dem er den samme
rettelsen: Pereira, Soltvedt og de Lanlay sto som **`utledet` 79** — de lå i
grunnsjiktet malen aldri skilte — mens kilden belegger dem med 433 Viking-kamper,
en Premier League-karriere og et landslagsopphold. Svein Kvia er hevet fra 83 til
86 (551 kamper, fire strake gull, tre ganger årets spiller i Norge).

Det er hele poenget med `classSource`: en `utledet` verdi er ikke en påstand, den
er en plassholder som venter på en kilde. Når kilden kommer, flyttes den.

### Brann: 75 navn, og seks nivåer som ventet på en kilde

Brann-arven går fra cupmesterne på 1920-tallet med Alexander Nagelsett Olsen og
Finn Berstad, gjennom Kniksen og seriegullene i 1961/62 og 1963, til seriegullet
i 2007 og sølvlagene i 2023 og 2024.

55 nye navn. **Tjue lå allerede i katalogen** — flere enn i noen tidligere import,
fordi Brann-spillere går igjen på Lerkendal, Intility og Briskeby. Alle ble
koblet på, ingen kopiert.

Tolv nivåer er rettet mot kilden, og seks av dem sto som **`utledet`**: Azar
Karadas, Hassan El Fakiri, Raymond Kvisvik, Kjetil Løvvik, Jan Gunnar Solli,
Ruben Kristiansen og Felix Horn Myhre lå i grunnsjiktet malen aldri skilte, mens
kilden belegger 263 Brann-kamper, en Monaco-karriere, en cupfinale og en
landslagsdebut. Det er tredje import på rad der `utledet`-merkelappen peker rett
på hvem som fortsatt mangler kildedekning.

### Tromsø: 81 navn, og fire som står bredt

TIL-arven begynner ikke kunstig med opprykket i 1985. Den går fra
stiftelsesgenerasjonen og Sverre Isaksen via de nordnorske mesterskapene i 1931,
1949 og 1956, gjennom cupgullene i 1986 og 1996, til medaljelagene og dagens
generasjon.

68 nye navn, 10 koblet på. Seks nivåer rettet fra `utledet`: Koppinen, Rune
Lange, Hirschfeld, Essediri, Moldskred og Runar Berg.

**Fire spillere står bredt.** Roald Jan Pedersen, Trond Steinar Albertsen,
Sigmund Forfang og Erik Pedersen lot seg ikke posisjonsbestemme pålitelig, og da
er regelen den samme som for Harry Yven: bred posisjon, tom `usablePositions`, og
en advarsel som sier det rett ut. Spillet dikter ikke opp en rolle de kanskje
aldri hadde.

Kilden inneholdt også en **rettelse**: Yngvar Håkonsen skal ikke regnes blant
1996-legendene — han kom til klubben først i 2006. Han var ikke i katalogen, så
rettelsen betyr at han ikke legges inn.

### Molde: 84 navn, og den første importen som ikke fortynnet

Molde-arven går fra Arne Legernes og 1950-tallet, via sølvlaget i 1974 og
cupgullet i 1994, gjennom Champions League-laget i 1999, til seriegullene fra
2011 og framover.

66 nye navn, 12 koblet på. Seks nivåer rettet, to av dem fra `utledet` — Makhtar
Thioune og Harmeet Singh. Daniel Berg Hestad er hevet til 86: 666 offisielle
kamper og sju titler er klubbrekord.

**Dette er den første importen som brukte lærdommen fra Tromsø fra start.** Alle
66 nye fikk styrkene lest ut av kildens egne beskrivelser — «klubbens historiske
toppscorer», «drivkraften på sølvlaget», «forsvarsleder», «klubbrekord med 75
europakamper» — i stedet for malens generiske sett.

Utslaget er målt: uniktheten i ferdighetsprofilene **steg fra 58 % til 61 %**.
Hver tidligere import senket den. Det er forskjellen på å importere en liste og å
lese den.

**Fem navn kom til i en andre runde.** Kildens epokeavsnitt sier «bør også inn i
spillerpoolen» om spillere som ikke står i den anbefalte poolen på 84 — Ole Erik
Stavrum, Sindre Rekdal, Berdon Sønderland og Øystein Neerland fra cupfinalene i
1982 og 1989, og David Datro Fofana fra 2022-laget. De fire første er de eneste
Molde-navnene som står som **`utledet`**: kilden gir posisjon og cupfinalelag,
men ingen spillerbeskrivelse, og da skal styrkene bli stående på posisjonsmalen.
Fofana beskrives («stort gjennombrudd før overgang til Chelsea») og er `belagt`.

### Klubbstatus bor på spilleren

Hver arvespiller har en `clubStatus` — klubbikon, klubblegende, elitekarriere,
gullalderens kjerne, nøkkelspiller, klubbprofil, akademi/eksport, stjerne med
kortere opphold eller troppsprofil — og et `clubStatusSource` som skiller
**kuratert klubbhistorie** (172 spillere) fra **utledet** (495).

Statusen lå en periode i to egne motorfiler, `football-club-player-profiles.js`
og `football-valerenga-player-profiles.js`, som ~900 linjer hardkodede
navnelister med normalisert navnematching. Symptomet sto i lista selv: den måtte
inneholde «Karl-Petter «Kalle» Løken», «Karl-Petter Løken» *og* «Mini Jakobsen»
som separate oppslag, fordi matchingen skjedde på navn i stedet for id.

Det er husregelen snudd på hodet. `data/*.json` er fasit; en motor med 900
linjer spillernavn er en katalog forkledd som kode. De to modulene er borte,
innholdet ligger i spillerdataene, og `listClubHeritagePlayers()` sorterer på
klassehøyde med status som skille ved likhet.

De 53 posisjonskorreksjonene modulene bar med seg er skrevet inn i
spillerpostene, der de hører hjemme. Resten av det de produserte — `strengths`,
`classSource`, `documentedPositions` — var gjenfortelling av felter spilleren
allerede hadde, og er droppet.

`audit:attributes` vokter nå både vokabularet, at hver status er i bruk, at ingen
enkeltstatus tar mer enn 60 %, og at **ingen motorfil hardkoder spillernavn**.
Alle tre bittestet.

### Sarpsborg og HamKam

Arven på Sarpsborg stadion dekker **byens fotball**, ikke ett klubbnummer:
Sarpsborg FK og Sarpsborg 08 deler bane i spillet, så Asbjørn Halvorsen (cupgull
1917, senere tysk mester med HSV) ligger i samme pool som Krépin Diatta og
Jørgen Strand Larsen.

HamKam viste seg like sterk: 26 navn fra Pål Jacobsen og Terje Kojedal via Finn
Thorsen og Jan Åge Fjørtoft til Cato Erstads klubbrekord på 506 kamper.
Kriteriet er at spilleren har **representert klubben** — det holder.

### Rosenborg: 156 navn, og samme mal

Rosenborg-arven er nå den største: 156 navn, fra Odd Iversens 1960- og 70-tall
gjennom Eggens gullrekke 1992–2004 til dagens lag. Den er generert med **samme
posisjonsmal som Vålerenga** — kilden oppgir primærposisjon for hvert navn, og
det er den som styrer arketyper, styrker, behov, roller og taktikkpreferanser.

**Atten navn lå allerede i katalogen og ble koblet på, ikke kopiert.** Det er den
faktiske faren ved en liste på 156: Odd Iversen og Steffen Iversen lå på Intility,
Sigurd Rushfeldt på Romssa, Karl-Petter Løken og Anders Trondsen på Sarpsborg,
Thorstein Helstad på Brann og Briskeby. Generatoren stopper på duplikat mot både
sin egen liste og katalogen, så et navn kan få en ny `sourcePlaceId`, men aldri en
ny oppføring.

Det gir en **skjevhet som er blitt betydelig**: Lerkendal åpner 156 navn,
Intility Arena 126, Sarpsborg stadion 32 og Briskeby 26 — mens Color Line Stadion
åpner 1.

Poolen er hva du kan *velge blant* — du stiller fortsatt elleve — men en større
pool betyr mer valgfrihet til å finne spillere som passer systemet ditt. Med
156 mot 1 er det ikke lenger en nyanse: å ta over Rosenborg og besøke Lerkendal
gir vesentlig mer å bygge på enn å ta over Aalesund og besøke Color Line.

Skjevheten løses ved å **utvide de andre klubbene**, ikke ved å beskjære
Vålerenga. Dekningen er et spørsmål om hvor godt klubben er kartlagt, ikke om
hvor god klubben er — og den forskjellen bør ikke gjøres om til spillbalanse.

Posisjonsdekningen er komplett i alle tre: keeper, back, stopper, seksser,
midtbane, kant og spiss.

### Spillere som tilhører flere klubber

32 spillere står på to eller tre baner, fordi de faktisk spilte begge steder —
blant dem **Brede Hangeland** (Ullevaal + Lyse Arena), **Thorstein Helstad**
(Brann + Briskeby + Lerkendal), **Ronny Johnsen**, **John Carew**, **Tore André
Flo** og **Sander Berge** (Ullevaal + Intility), **Pål Jacobsen** (Briskeby +
Intility) og **Odd Iversen** (Intility + Lerkendal).

Det er ikke duplikater, og vakten skiller dem fra ekte duplikater: en spiller kan
ha flere `sourcePlaceIds`, men aldri to oppføringer. De som har en landslagsarena
blant kildene sine holdes fortsatt utenfor grunntroppene — én visit skal ikke
sikre en nasjons beste.

### Når kilden ikke rekker: bredt, ikke oppdiktet

Fem Sarpsborg-navn sto en periode utenfor katalogen fordi posisjonen ikke lot
seg slå opp. De er inne nå, og hvordan de ble registrert er verdt å merke seg:

| Spiller | Registrering | Hvorfor |
|---|---|---|
| Kristian Henriksen | CB, sekundært DM/CM | «Half» i datidens system er omtrent defensiv/sentral midtbane — ikke en moderne kantrolle |
| Thor Spydevold | CB, sekundært DM/CM | Debuterte på landslaget som midtstopper; FFK-historikken fører ham også som midtbanespiller |
| Harry Yven | **ST, uten sekundærposisjon** | Kildene sier «angrepsspiller» og ikke mer |
| Joachim Thomassen | LB/WB, sekundært LW | Primært venstreback, også vingback og venstre midtbane |
| Jan Kristian Fjærestad | ST | Rendyrket måljeger — toppscorer med 18 mål da Moss ble seriemester i 1987 |

**Harry Yven er regelen i miniatyr.** Dokumentasjonen rekker til «angrepsspiller»
og ikke til om han var senterløper, indreløper eller ving i datidens
femmannsrekke. Da står han bredt som spiss, med tom `usablePositions` — spillet
dikter ikke opp en rolle han kanskje aldri hadde. Advarselen hans sier det rett
ut i stedet for å skjule det.

### Tre klubber uten navn

Kristiansund, Sandefjord og KFUM har bane men ingen navn. Oppslagene ga ingen
pålitelig legendeliste, og et halvhusket navn med gal posisjon er verre enn et
ærlig «ingen historiske spillere i katalogen ennå». (HamKam sto i denne raden
til klubben ble kartlagt — 26 navn.)

**Hvert eneste navn har fått posisjonen slått opp før det ble lagt inn:**

| Spiller | Klubb | Posisjon (verifisert) |
|---|---|---|
| Svein Kvia | Viking | midtbane, 551 kamper for klubben |
| Erik Nevland | Viking | spiss |
| Brede Hangeland | Viking | midtstopper |
| Sigurd Rushfeldt | Tromsø | spiss |
| Morten Gamst Pedersen | Tromsø | venstreving |
| Ole Martin Årst | Tromsø | spiss |
| Per «Snæbbus» Kristoffersen | Fredrikstad | spiss, fire ganger toppscorer |
| Arne Pedersen | Fredrikstad | oppspiller |
| Bjørn Borgen | Fredrikstad | kantspiller |
| Roar «Pontus» Johansen | Fredrikstad | forsvar |
| Erik Mykland | Start | midtbane |
| Svein «Matta» Mathisen | Start | offensiv midtbane, 106 mål på 327 kamper |
| Tor Hogne Aarøy | Aalesund | spiss |

Fredrikstad-trioen Kristoffersen–Pedersen–Borgen sto bak seks serie- og cupgull
fra 1957 til 1966 — hentet fra klubbens dokumenterte gullalder, ikke satt sammen
etter skjønn.

Brede Hangeland lå allerede på Ullevaal som landslagsspiller. Han kom gjennom
Viking, så han står nå på begge steder — og fordi han har en landslagsarena i
`sourcePlaceIds`, holdes han fortsatt utenfor grunntroppene.

### Grunntroppen er et gulv, ikke en snarvei

- Den inneholder **aldri** klubbens egne historiske spillere. Gjorde den det,
  ville gaten vært pynt: du fikk Brattbakk uten å gå til Lerkendal.
- Den deler aldri ut landslagsarena-spillere (Ullevaal, Maracanã) — én visit
  skal ikke sikre en nasjons beste.
- Den plukker de **jevneste**, ikke toppsjiktet. Målt: 86,8 i snitt mot et
  poolsnitt på 88,5; snur man sorteringen havner den på 90,0.

Den siste målingen avslørte en for svak vakt. Første grense var «≤ snitt + 1»,
og en bitetest som snudde sorteringen gikk **rett gjennom**. Terskelen måtte
ligge mellom de to målte verdiene, ikke i nærheten av den ene.

### Motoren rører aldri progresjonen

`football-club-squad.js` **leser** besøkte steder som en liste inn og skriver
aldri til `visited_places` eller `hg_groundhopper_stats_v1`. Vakten sjekker at
navnene ikke engang forekommer i kilden.

`sim:club-squad`: 172 sjekker, seks vakter bittestet. Verifisert i nettleser i
begge tilstander — der oppdaget jeg at `visited_places` er et **objekt**, ikke en
array, så den første testen min leste ingenting og ga samme svar i begge
tilfeller.
