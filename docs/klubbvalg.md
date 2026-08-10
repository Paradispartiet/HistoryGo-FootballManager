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
| **Har ikke vært der** | En automatisk grunntropp fra klubbens egen spillerpool. Resten av klubbpoolen åpnes når du besøker banen. |

Det er kjernesløyfen brukt **på** klubbovertakelsen i stedet for å omgå den —
samme form som landslagsmodus, der nasjonens grunntropp er bunnen og samlingen
er oppsiden.

Klubbmedlemskap og oppdagelsessted er nå to forskjellige fakta. `clubAffiliations`
på spilleren bestemmer hvilken klubbpool spilleren tilhører. `sourcePlaceIds`
bestemmer bare hvilke History Go-steder som kan oppdage/låse opp spilleren.
`homePlaceId` kobler separat klubben til banen som åpner resten av poolen. En
spiller kan dermed være dokumentert klubbspiller uten at klubbidentiteten
avhenger av hvor History Go-kortet hans ligger.

| Klubb | Bane | Historiske spillere |
|---|---|---:|
| Rosenborg | Lerkendal | 156 |
| Strømsgodset | Marienlyst stadion | 143 |
| Vålerenga | Intility Arena | 127 |
| Sarpsborg 08 | Sarpsborg stadion | 107 |
| Fredrikstad | Fredrikstad stadion | 100 |
| Odd | Skagerak Arena | 100 |
| Haugesund | Haugesund stadion | 100 |
| Skeid | Nordre Åsen | 100 |
| Aalesund | Color Line Stadion | 90 |
| Bodø/Glimt | Aspmyra stadion | 89 |
| Molde | Aker stadion | 89 |
| Start | Sparebanken Sør Arena | 85 |
| Mjøndalen | Consto Arena | 83 |
| Lyn | Bislett Stadion | 82 |
| Moss | Melløs | 82 |
| Tromsø | Romssa Arena | 81 |
| HamKam | Briskeby | 81 |
| Ranheim | Extra Arena | 81 |
| Kongsvinger | Gjemselund | 79 |
| Brann | Brann Stadion | 75 |
| Sogndal | Fosshaugane Campus | 75 |
| Stabæk | Nadderud | 75 |
| Viking | Lyse Arena | 70 |
| Hødd | Høddvoll | 69 |
| Sandefjord | Jotun Arena | 68 |
| Bryne | Bryne stadion | 68 |
| KFUM Oslo | KFUM Arena | 66 |
| Lillestrøm | Åråsen | 56 |
| Strømmen | Strømmen stadion | 54 |
| Kristiansund | Nordmøre stadion | 49 |

**Alle 16 eliteserieklubbene har bane**, pluss Stabæk, Lyn, Strømsgodset, Odd,
Haugesund, Skeid, Moss, Bryne, Hødd, Mjøndalen, Sogndal, Kongsvinger, Ranheim
og Strømmen — 2580 arveplasser fordelt på alle 30, og **ingen klubb med bane
har under 49 navn**. De 30 klubbene som
mangler bane sier det rett ut i profilen i stedet for å late som. **Alle klubber
med en nasjonal tittel har arv**, og Mjøndalen og Skeid ligger begge i
2. divisjon.

Arven er ikke lenger et eliteserieprivilegium. Strømsgodset, Odd, Haugesund,
Lyn, Moss, Bryne og Hødd ligger i OBOS-ligaen, og **Skeid ligger i 2. divisjon med den delt
fjerde største arven i katalogen** — åtte cupgull mellom 1947 og 1974 forsvinner
ikke fordi klubben i dag spiller på tredje nivå. Det er riktig — arv er klubbens
historie, ikke dens tabellplass i dag.

Summen er *plasser*, ikke personer: 280 spillere står på to eller flere baner
fordi de faktisk spilte begge steder, og teller derfor hos hver klubb.

**Klubber uten ferdig spillerpool blir ikke lenger fylt med tilfeldige ekte spillere.** De står som `pending` i klubbdataene og er midlertidig ute av overtakelseslista til minst 15 dokumenterte klubbtilknytninger finnes. Poolen kan bygges ferdig uavhengig av om klubben allerede har et History Go-sted.

Tabellen over er **vaktet mot dataene** (`sim:club-squad`): et tall som ikke
stemmer, en klubb som står to ganger, eller en klubb med spillere plassert i
null-raden, faller. Den vakten finnes fordi arvetabellen drev fra dataene tre
ganger — et redigeringsskript som avbrøt midtveis, en delvis redigering som ga
Rosenborg to rader, og HamKam som sto både med 26 spillere og som tom. Ingenting
feilet, for dokumentasjon leses ikke av noen vakt. Nå gjør den det.

### Vålerenga: 127 navn, lest fra kilde etter å ha vært malgenerert

Vålerenga-arven er den nest største: 127 navn fra Henry «Tippen» Johansen og
Einar «Bruno» Larsens klubbrekord på 99 mål, gjennom gullalderen 1980–1984, til
akademiet som har solgt Sahraoui, Odin Thiago Holm og Jones El-Abdellaoui.

**Den var malgenerert, og det var den største gjenstående gjelden i katalogen.**
Da lista kom hadde jeg bare primærposisjon per navn, så styrkene ble generert
fra posisjonen. Begrunnelsen som sto her — at 126 håndskrevne varianter ville
vært falsk presisjon — var riktig så langt den rakk, men den beskrev et valg
mellom mal og oppfinnelse. Det var aldri de eneste to mulighetene: den tredje
var **en kilde som faktisk beskriver spillerne**, og den fantes ikke ennå.

Nå gjør den det. Kilden gir *Styrker*, *Begrensninger* og en eksplisitt
**Kildegrad** per spiller (A: 55, B: 62, C: 10), og styrkene er lest inn ord for
ord: 201 ulike fraser kartlagt til ferdighetsvokabularet i
`data/football_attributes.json`, hver spiller med tokens fra **sin egen
setning**. 126 av 127 fikk nye styrker, og de 127 fordeler seg på 125 ulike
styrke-sett.

Kilden setter selv grensene, og de er fulgt:

> «Listen lager ikke målte attributter og bør ikke brukes som belegg for
> eksakte 1–20-verdier uten en egen individuell kildeaudit.»

Derfor går frasene inn i `strengths` — tokens motoren *utleder* fra — aldri som
håndskrevne tall. Og:

> «For C-profiler bør spillet bruke brede rolleprofiler og lav
> evidenssikkerhet, ikke detaljerte påstander om fart, teknikk eller
> mentalitet.»

Derfor får C-profilene maks tre tokens mot fems for A og B, og beholder
`classSource: utledet` mens A og B settes til `belagt`.

Målt effekt på hele katalogen: profiluniktheten gikk **73,7 % → 78,6 %** og
styrke-settene **46,9 % → 56,4 %**. De to største kollisjonsgruppene i
katalogen, på 34 og 27 spillere, er borte. Begge vaktene er ratchetet opp
(0,70 → 0,76 og 0,46 → 0,52), og bitetesten er å reversere VIF til mal: da
faller de til 74,4 % og 44,4 %, og begge feller.

**Aliaser er kanonisert, med vilje.** `power` og `physical_presence` peker
begge på `strength`. Lagres aliasene rått, ser styrke-settene mer ulike ut enn
de er — og da måler uniktheten synonymer i stedet for spillere. Det ville vært
å pynte på nøyaktig det tallet som skulle vise om jobben var gjort.

**Joshua King er nå inne — som akademitilknytning.** Han sto utenfor fordi
«akademikategorien ikke finnes i datamodellen». Det stemte ikke: `academy_export`
påstår ingen A-kamper, den sier at klubben utviklet ham og at han gikk videre.
Kilden ber uttrykkelig om at han registreres slik, og advarselen hans sier det
rett ut.

**«Tom Jacobsen (VIF)» og «Tom Jacobsen» var samme mann.** Kilden sier det selv
— «HamKam-profil hentet til VIF; kaptein og midtbanebærer i cup- og
seriemesterlagene» — og katalogen bar ham to ganger, med halve karrieren på
Briskeby og halve på Intility. Nær-duplikat-vakten så det ikke, fordi
klubbsuffikset gjør navnene fire tegn fra hverandre. Den er utvidet: et navn som
er et annet navn pluss en parentes er ikke en navnelikhet, det er noen som har
disambiguert seg ut av en kollisjon. Den nye regelen fant «Tore Pedersen (RBK)»
med én gang — der er suffikset riktig, for RBKs Tore Pedersen er offensiv
midtbane (79) og Branns er midtstopper med landskamper (86).

Fire posisjoner er rettet mot kilden, som oppgir primærposisjonen først:
Jarl-André Storbæk sto som venstreback der kilden sier **høyreback**, og Dag
Riisnæs, Daniel Fredheim Holm og Kristofer Hæstad sto med sekundærposisjonen
først.

Kilden rydder også opp i noe katalogen hadde riktig: **Tom R. Jacobsen var
keeper, Tom Jacobsen var sentral midtbanespiller og bror av Pål Jacobsen.**
De er og blir to spillere.

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

### Bodø/Glimt: 89 navn, og sju `utledet` løftet på én gang

Glimt-arven går fra Harald «Dutte» Berg — kåret til tidenes norske fotballspiller
i 1976 — via cupgullet i 1975 og cupmesterlaget fra 1993, til de fire
seriegullene og Champions League-åttendedelsfinalen i 2026.

64 nye navn, 19 koblet på. **Elleve nivåer rettet, sju av dem fra `utledet`**:
Arne Hanssen, Tom Kåre Staurvik, Terje Mørkved, Trond Sollied, Jan-Derek
Sørensen, Anders Konradsen og Trond Olsen lå alle i grunnsjiktet malen aldri
skilte — mens kilden belegger klubbens mestscorende spiller gjennom tidene, to
cupfinalescoringer, en Dortmund-karriere og en landslagsspiller.

Det er den største enkeltrettelsen så langt, og den kom fordi Glimt-spillere går
igjen på Lerkendal: sju av dem lå der som navn uten karriere.

Alle 64 nye fikk styrkene lest fra kildens beskrivelser fra start — samme
framgangsmåte som Molde, ikke som de fire første importene.

Kildens europagenerasjon-avsnitt sier «bør også inn i spillerpoolen» om fem navn
utenfor den anbefalte poolen på 84 (Elias Hagen, Isak Dybvik Määttä, Joel Mvuka,
Tobias Gulliksen, Sondre Sørli). De er med — samme avklaring som for Molde.

### Kristiansund: 49 navn, og en grense kilden trakk selv

KBK ble stiftet i 2003 og har ni sesonger på øverste nivå. Arven er derfor
mindre, og nivåbåndet ligger lavere enn hos klubbene med gullaldere — det er
hva kilden bærer, ikke en nedvurdering.

43 nye navn, 6 koblet på. Ett nivå rettet fra `utledet`: Marius Broholm.

**Kilden trakk en avgrensning jeg fulgte.** Ole Gunnar Solskjær spilte for
Clausenengen før KBK ble stiftet, og skal derfor ikke være KBK-spiller. Han
ligger på Aker stadion som Molde-spiller og er *ikke* knyttet til Nordmøre
stadion. Importskriptet kaster hvis han blir det.

Magne Hoseth kvalifiserer derimot på to obligatoriske kamper i 2017 — kriteriet
er at spilleren har representert A-laget, ikke hvor lenge.

### KFUM Oslo: 66 navn, og statusen som måtte flyttes

KFUM er den yngste eliteserieklubben i katalogen — opprykket kom i 2023, og
arven er derfor kort i tid og bred i bredde: 60 nye navn på KFUM Arena, 6 koblet
på fra andre baner.

Kilden ga selv den avgjørende avklaringen, og den brøt datamodellen:

> Henning Berg bør ha høyest samlet internasjonalt toppnivå, men lavere
> KFUM-lojalitet enn de egentlige klubblegendene.

Henning Berg er `elite_career` på Intility og Åråsen og `short_stay_star` på
KFUM Arena. Magnus Wolff Eikrem har den sterkeste tekniske grunnprofilen i
troppen og lav KFUM-status, fordi oppholdet startet i 2026. Det er ikke to
motstridende påstander om samme person — det er **to klubbers forhold til
ham**, og de er begge riktige.

`clubStatus` lå som ett felt per spiller, altså som en påstand om personen. Den
er nå et **kart per bane**, og det er der den hører hjemme (se under). Ett
nivå rettet fra `utledet` 79 til `belagt` 82: Amin Nouri.

### Stabæk: 75 navn, og tre oppføringer som var direkte gale

Stabæk hadde bane fra før, med **tre** navn på Nadderud. Nå står det 75: 53 nye
og 22 koblet på. Klubben ble stiftet i 1912, men historien kilden beskriver
starter i 1990 — femte divisjon, «Ullevaal ’95», Eliteserien fra 1995, cupgull
i 1998 og seriegull i 2008.

**De tre som lå der fra før var alle for lavt satt, og én var direkte feil.**
Morten Morisbak Skjønsberg sto som `utledet` **78** og `squad_profile`. Han er
klubbens mannlige kamprekordholder med 384 obligatoriske kamper, akademispiller,
kaptein og seriemester. 78 er `bredde`-båndet — «begrenset fotavtrykk i toppen»
— om den mestspillende mannen i klubbens historie. Rettet til `belagt` 83 og
`club_icon`. Daniel Nannskog sto på 82 med en hold-up-profil; kilden ber om
«maksimal avslutningsevne, bevegelse, aggressivitet og målteft» for en spiller
med 122 mål på 182 kamper og to eliteserietoppscorertitler — rettet til 85 med
avslutterprofil. Veigar Páll Gunnarsson fra 82 til 84.

Det er verdt å merke seg *hvorfor* de var gale: de tre kom fra en tidlig,
tynn import og ingen vakt kan se at et nivå er for lavt. Det finnes ingen
måling for «denne spilleren er undervurdert» — bare en kilde som sier det.

**Kildens eget antall var feil, og det er første gang.** Den oppgir 76 navn,
men «Franck Boli» står i elitelista og «Frank Boli» i samlingslista — samme
spiller, to stavemåter. Poolen er 75 unike. Alle tidligere kilder har hatt et
antall som stemte, så importskriptet teller nå etter og ville stoppet på en
kollisjon.

Fire navn var nesten-treff som en ren navnesammenligning ville bommet på:
Morten **Morisbak** Skjønsberg, **Mix** Diskerud, Karl-Petter **«Kalle»** Løken
og «Morten Skjønsberg» mot **Marius** Skjønsberg (Lyn) — to forskjellige menn.
Jon Knudsen (Stabæk, keeper, moderne) og Jan Knudsen (Brann, keeper, historisk)
er også to menn, og er holdt fra hverandre.

22 koblinger er den høyeste andelen så langt etter Lyn: Stabæks akademi har
levert til nesten hele katalogen, og Antonio Nusa, Hugo Vetlesen, Emil Bohinen,
Ola Brynhildsen, Birger Meling og Andreas Hanche-Olsen står nå som
`academy_export` på Nadderud og som noe annet der de fikk karrieren sin.

### HamKam: fra 26 til 81 navn, og en tredje vakt som byttet form

Briskeby hadde 26 navn fra før — den siste av de fire klubbene som lenge sto
med bane og ingen navn. 55 nye på, og HamKam er nå på nivå med Tromsø.

Best formede v2-kilde så langt: **85 unike kvalitetssetninger OG 85 unike
historikkfelt**. Men også den som avstår oftest — **41 av 85** sier at ingen
ferdighet bør fylles uten ny individuell kilde, i sin egen ordlyd. Markøren har
nå tre varianter på tvers av kildene, og tokeniseringen kjenner igjen formen i
stedet for ordlyden.

Epoken: to kategorier daterte seg selv, og «Stor total karriere» landet på 89 %
— akkurat under terskelen. Denne gangen var den *konservativ og ikke feil*:
begge de udaterte er åpenbart moderne, og kilden sier det med klubbene den
navngir (Sparta Praha, dansk klubbfotball, Thailands landslag).

#### Tredje gang: også styrke-spredningen måtte per klubb

Jeg skrev sist at «neste gang bør den starte per klubb». Den gjorde ikke det, og
HamKam viste hvorfor.

Den korpusbrede andelen unike styrkesett falt fra 60,4 % til 59,6 % og brøt
ratcheten. Men målt **per arv** ligger Briskeby på **82 %** — over medianen.
Forskjellen er *kryss-klubb-kollisjoner*: to midtstoppere fra hver sin klubb med
«duels, heading, positioning» kolliderer, og det sier ingenting om kildene
deres. Antallet kombinasjoner kildene faktisk produserer er begrenset, så det
korpusbrede tallet synker for hver import uansett kvalitet — nøyaktig det en
ratchet ikke skal gjøre.

Per arv diskriminerer det derimot skarpt, og rangeringen stemmer med det vi
visste om kildene fra før:

| Arv | Unike styrkesett | |
|---|---:|---|
| Lerkendal | 43 % | de to tynneste kildene |
| Marienlyst | 45 % | |
| Høddvoll | 52 % | v2-kildene som avstår ofte |
| Consto Arena | 63 % | |
| **Briskeby** | **82 %** | over medianen |
| Fredrikstad, Romssa, Color Line | 100 % | |

Median 82 %, gulv satt på 40 % rett under Lerkendal. Bittestet ved å male hele
Start-arven på posisjonsmal: Sør Arena faller til 9 %.

Det korpusbrede tallet blir stående som en løs bunnlinje på 50 %, ikke som
ratchet — det fanger et kollaps, ikke en fortynning.

Briskeby er lagt til i den navngitte lista over arver med et ekte hull: 26 av 81
uten dokumenterte styrker, tak 34 %.

Nær-duplikat-vakten fant ett par, to menn: Rosenborgs midtstopper Svein
Haagenrud mot HamKams keeper Svein Inge Haagenrud, «en av klubbens beste»
gjennom åtte sesonger.

### Mjøndalen: fra 0 til 83 navn, og vakten som byttet form igjen

Cupmester i **1933, 1934 og 1937**, seriesølv i 1976 — og klubben lå i
2. divisjon uten bane og uten ett eneste navn. Consto Arena er lagt inn som
sted. 83 av 85 inn, bare to utelatt på posisjon.

Samme v2-form som Hødd, men en klart bedre kilde: **85 unike
kvalitetssetninger OG 85 unike historikkfelt**. Den sier likevel fra om sine
egne hull, og det gjelder **31 av 85** — de fleste fra cupmesterlagene, der
kilden bare har «fast på cupmesterlaget 1937». Ni til er moderne spillere hvis
eneste påstand er *overgangsverdi*, som ikke er en ferdighet.

Epoken gikk nesten av seg selv: tre av fire kategorier daterte seg selv, og
90 %-terskelen avviste den fjerde — «Øverste Mjøndalen-legende» står 21
historiske mot 3 moderne, altså 87,5 %. Terskelen hadde rett for tredje gang:
den ene udaterte i kategorien er klubbens moderne kaptein gjennom opprykkene,
ikke en cupvinner fra 1930-tallet.

#### Andre gang huset lærer at en korpusbred andel er feil form

Vakten fra Hødd-runden — «andelen uten dokumenterte styrker vokser ikke» — sto
på 1,2 % av hele korpuset. Mjøndalen tok den til 2,4 %, og det er nettopp den
formfeilen per-klubb-målingen ble innført for å rette da styrke-settene led av
den samme: **en andel av 1800 spillere blir uskarpere for hver import.**

Målingen er nå per arv, og de to arvene med et ekte hull står navngitt med sin
målte verdi:

| Arv | Uten dokumenterte styrker | Tak |
|---|---:|---:|
| Høddvoll | 13 av 69 (19 %) | 21 % |
| Consto Arena | 32 av 83 (39 %) | 41 % |
| *alle andre* | 0 | 5 % |

Da kan de to ikke vokse, og en ny kildeløs klubb kan ikke gjemme seg i
gjennomsnittet. Bittestet begge veier: åtte tomme lister på Nordre Åsen feller
femprosentstaket, og tre flere på Høddvoll feller Høddvolls eget.

Profilunikheten måtte deles på samme måte og av samme grunn. En spiller uten
dokumenterte styrker har ingen individuell påstand å skille seg på — profilen
hans er posisjon pluss epoke pluss klassetak, og han *skal* ligne andre med
samme posisjon og epoke. Målt: **86,2 % blant de dokumenterte**, 56,8 % blant de
44 uten (største klon 5 — posisjon og epoke skiller dem fortsatt). Blandet blir
tallet 85,5 %, og da måler ratcheten hvor mange udokumenterte spillere som
nettopp ble importert, ikke hvor godt profilene skiller folk fra hverandre.

Nær-duplikat-vakten fant ett par, to menn: Tromsøs historiske spiss Petter
«Kykkeliky» Jensen mot Mjøndalens moderne forsvarsspiller Petter Eichler Jensen.

### Hødd: fra 0 til 69 navn, og kilden som sa fra om sine egne hull

Cupgullet i 2012 (1–1 mot Tromsø, 4–2 på straffer), og en gullalder klubben
selv daterer til 1963–1972. Høddvoll er lagt inn som sted. 58 nye navn, 11
koblet på, **16 utelatt** på «Historisk utespiller».

Dette er den vanskeligste kilden i hele rekka, og den eneste som **sier fra**.

#### Førsteutgaven var en posisjonsmal

Den hadde **fem kvalitetssetninger for 85 profiler**, og de fem var én per
posisjonsgruppe — midtbane, forsvar, spiss, ving, keeper. 85 ekte, navngitte
menn ville blitt fem profiler. Til sammenligning hadde de seks kildene før
Bryne 100 % unike setninger.

Andreutgaven erstattet dem, men ikke ved å finne nytt materiale. For **28 av 85**
er svaret ordrett:

> «Den dokumenterer ikke en individuell teknisk eller fysisk ferdighet **som bør
> importeres som strength uten ny kilde**.»

Det er kilden som selv trekker grensen, og den grensen er respektert. Tre til
har en påstand som ikke er en ferdighet («dokumentert høy historisk intern
vurdering», «langvarig fotballfaglig klubbrolle etter spillerkarrieren») — en
klubbrangering er nettopp det ene tallet dette prosjektet nekter å ha.

Etter posisjonsfilteret og to sammenslåinger står **13 spillere uten
dokumenterte styrker**. Verifisert i motoren: de får 58 verdier fra posisjons-
og epokegrunnlinja, og **null av dem er merket `belagt`**. Spillet innrømmer at
det ikke vet, i stedet for å finne på.

#### Metrikken måtte deles i to

`strengthShare` spør: er styrkene lest per spiller, eller **malt** per posisjon?
En tom liste er ingen av delene. Å telle de 13 som én kollisjon er sant om
strengene og usant om saken — en malt spiller har fått en påstand uten dekning,
en tom har ikke fått noen.

Målingen er derfor delt:

| Vakt | Måler | Grense | Målt |
|---|---|---|---|
| Unike styrke-sett | blant dem som **har** styrker | > 0,60 | 60,5 % |
| Uten dokumenterte styrker | andel av hele korpuset | **< 1,2 %** | 0,7 % |
| Tomme lister utenfor Høddvoll | skal være null | 0 | 0 |

Den andre er en **ratchet nedover** — den kan bare krympe. Til sammen er de tre
strengere enn den ene var: en tom liste ligner ikke en mal, så den gamle
metrikken ville aldri fanget en kildeløs klubb. Nå gjør den nye det. Alle tre er
bittestet; 12 flere tomme lister feller den på 1,4 %, og én tom liste utenfor
Høddvoll feller den tredje ved navn.

#### Epoken: to kategorier nektet igjen, og slekt avgjorde fire

«Øverste Hødd-legende» (13 moderne mot 7 historiske) og «Stor total karriere»
(6 mot 3) er ekte blandede, og 90 %-terskelen fra Bryne avviste begge. Ti navn
måtte dateres for hånd.

Seks knytter kilden til klubbyggingen — «laget som etablerte Hødd i 1. divisjon»,
«generasjonen som bygget Hødd opp til nasjonalt toppnivå», «en av de historiske
Hødd-profilene». Karsten Ulstein daterer seg selv indirekte: han «la **senere**
ned 38 år som frivillig rundt A-laget».

De fire andre daterer kilden ved **slekt**, og det er uvanlig presist: Geir
Hasund er «sønn av Kjetil Hasund» (gullalderen 1963–1972) og Egil Ulfstein er
«andre generasjon Ulfstein», sønn av Jan Ulfstein (302 kamper 1962–1972). Ett
slektsledd etter gullalderen er moderne.

Nær-duplikat-vakten fant to par, begge samme mann og begge fra finalelaget 2012:
**Ørjan Nyland** (banens beste i finalen, senere Molde og landslaget) og
**Fredrik Klock** (kaptein og forsvarsleder, senere Aalesund).

### Bryne: fra 0 til 68 navn, og en terskel som slapp gjennom én feil

Cupgull i 1987, seriesølv på 80-tallet og europacup i 1981, 1983 og 1988 — et
lag fra Jæren som slo seg opp på arbeid. Bryne stadion er lagt inn som sted.

53 nye navn, 15 koblet på. **17 av kildens 85 står utenfor**, den største
utelatelsen så langt, og den er kildens egen ærlighet: de er navn fra klubbens
eldste bevarte lagbilde fra 1928 og fra opprykkstroppen i 1975, ført med
posisjonen «Historisk utespiller». Kilden vet at de spilte ute, ikke hvor.
Posisjon styrer arketyper, roller, styrker og svake sider, så en gjettet
posisjon er en påstand om en ekte mann.

Det henger sammen med et annet tall: **66 unike kvalitetssetninger for 85
profiler**, den første kilden siden Rosenborg som gjenbruker. Én eneste setning
— «Klubblojalitet, pionerånd, arbeidsvilje og historisk lagverdi» — dekker alle
20 i pionerkategorien. Den beskriver kategorien, ikke spillerne. 17 av de 20
faller ut på posisjon uansett, så gjenbruket rammer tre navn.

#### Terskelen ble hevet fra 80 % til 90 %, og Bryne er grunnen

Regelen fra Skeid lar de daterte profilene i en kategori datere de udaterte, når
kilden har vist nok til det. Terskelen sto på 80 %.

«Øverste Bryne-legende» har **11 daterte før 2000 og 2 etter — 84,6 %**, altså
innenfor. Men blant de 12 udaterte i samme kategori ligger **Tommy Høiland**, en
Bryne-utviklet angrepsspiller fra 2010-tallet. En kategoridom på «historical»
ville datert ham feil, og ingenting ville sagt fra.

80 % var altså løst nok til å slippe gjennom én feil. De tidligere kildene taper
ingenting på 90 %: hver eneste kategori som fikk en dom hos Skeid og Moss var
100 % entydig (20/20, 25/25, 8/8, 16/16, 18/18).

Prisen er at Bryne får **null kategoridommer** for sine to store kategorier, og
at 17 profiler må dateres for hånd. Hver av dem står navngitt i importen med
kildens egen setning som begrunnelse, og alle er `utledet`:

| Grunnlag | Navn |
|---|---|
| Klubbrekorder (596/504/371/274 kamper eller mål) bygget i toppserie- og europaperioden | Høyland, Eskeland, Reime, Vold |
| Kilden bruker selv ordet «historisk» om dem | Sigbjørnsen, Andersen, Rangnes, Braut |
| «Toppserieperioden … den brede lokale stammen» = 1975–1993 | Mellemstrand |
| Den ene moderne blant legendene | Høiland |
| «Stor total karriere», hver beskrevet med klubben de gikk til | Håland, Grødem, Braut Brunes, Gauseth, Baldvinsson, Herrem, Hansen |

«Stor total karriere» kunne ikke få en kategoridom heller: 4 av de daterte er
moderne og 2 historiske, så **selvkontrollen forbød den** — den samme kontrollen
som tillot dommen hos Moss.

Nær-duplikat-vakten fant ett par, og det er samme mann: **Erling Braut Haaland /
Erling Haaland**, 16 A-lagskamper i OBOS-ligaen for Bryne i 2016 før Molde,
Salzburg, Dortmund og Manchester City. Bryne-importens kategoriregel ga ham 86;
katalogen har 97, og sammenslåingen tar det høyeste.

### Moss: fra 0 til 82 navn, og en sammenslåing vakten ikke kunne se

Seriegullet i 1987 kom under Nils Arne Eggen, cupgullet i 1983, seriesølvet i
1979 — og europacup mot Bayern München og Real Madrid. Klubben lå i OBOS-ligaen
uten bane og uten ett eneste navn. Melløs er lagt inn som sted.

64 nye navn, 18 koblet på. **Tre står utenfor**: kilden oppgir «Historisk
utespiller» som posisjon for Trygve Løken, Håkon Askerød og John Olsen. Det er
ærlig av kilden — den vet at han spilte ute, ikke hvor — men posisjon styrer
arketyper, roller, styrker og svake sider, så en gjettet posisjon er en påstand
om en ekte mann. De står utenfor til en kilde sier hva de spilte, samme
avgjørelse som for Lyns to navn uten posisjon.

95 % av frasene var dekket av de ti tidligere ordbøkene, og 98 % av
ferdighetssettene er unike internt.

#### Kategorien som ikke kunne datere seg selv — igjen

«Stor total karriere» har 20 profiler og **bare én datert**, altså under
terskelen på tre. Terskelen gjorde jobben sin ved Skeid, der nøyaktig den
kategorien blandet Braaten med Arne Natland fra «en tidlig
landslagsgenerasjon», og en majoritet ville datert tre menn feil.

Her er den ikke blandet, og det er **lest, ikke antatt**: alle 19 udaterte
beskrives med klubben de gikk til — Wimbledon, Austria Wien, Aberdeen, Dundee
United, Örebro, Viborg, Odense, Crystal Palace, Sundsvall — og hver eneste er en
1990-/2000-tallsspiller. Kilden har dessuten en egen kategori for de gamle
(«Historisk pioner / epokeprofil», 16 av 16 datert før 2000).

Avgjørelsen er derfor tatt på **kategori** og ikke på ni enkeltnavn, den står
synlig i importen, og den **kontrolleres mot kilden**: sier én eneste datert
profil i kategorien noe annet, kaster importen.

#### Feilen vakten ikke kunne se

Navnenøkkelen fjerner kallenavn i «...», så kildens «Nils Eriksen» traff
katalogens **«Nils «Påsan» Eriksen» fra Odd** — og importen slo dem sammen.

Odds Påsan spilte 208 obligatoriske kamper for Odd mellom 1929 og 1939.
Moss-kilden beskriver sin Nils Eriksen som klubbens store førkrigslandslagsprofil
med 47 landskamper *mens han spilte i Moss*. Begge deler kan ikke stemme om
samme mann i samme tiår.

**Dette er en feil nær-duplikat-vakten ikke KAN fange.** Resultatet er ikke to
like navn — det er én spiller på to baner, som er nøyaktig det dataene skal se
ut som når en mann faktisk spilte begge steder. Den ble funnet ved å lese hva
kildene sier om hverandres menn, ikke av en måling.

Å smelte to dokumenterte klubbkarrierer sammen er den ene feilen som ikke kan
angres, så tvilen faller ut til splitting. Moss-mannen bærer klubbsuffikset
katalogen allerede bruker for Tore Pedersen (RBK) og Sverre Andersen (Odd).

Motsatt vei: **Hans Deunk og Hans Jørgen Deunk er samme mann** — cupmester med
Moss i 1983, «langvarig forsvarsspiller rundt 1984-laget» hos Fredrikstad. Samme
posisjon, samme periode, og et etternavn som knapt finnes i norsk fotball
ellers. Slått sammen.

Tre menn heter nå Nils Eriksen i katalogen, og alle tre står gjennomgått: Odds
back fra 1930-tallet, Moss' førkrigsstopper, og Moss' keeper fra cup- og
seriemesterlaget i 1983 og 1987. I tillegg **Einar Aas / Einar Jan Aas** —
Aalesunds keeperkjempe fra 1951–1962 mot Moss-stopperen som spilte for Bayern
München og Nottingham Forest.

### Skeid: fra 0 til 100 navn, og en vakt som navnga en klubb

**Åtte cupgull mellom 1947 og 1974 og seriegullet i 1966** gjør Skeid til en av
Norges mest titteltunge klubber — og den lå i **2. divisjon** uten bane og uten
ett eneste navn. Nordre Åsen er lagt inn som sted; id-en følger konvensjonen og
må verifiseres mot History Go.

78 nye navn, 22 koblet på. Kilden er tydelig **mer forsiktig** enn de siste:
bare 40 av 100 profiler har «Høy» kildesikkerhet, 35 «Middels–høy» og 25
«Middels». Det er ærlig for en klubb hvis dokumenterte storhet ligger et halvt
århundre tilbake, og forsiktigheten leses som den er — «Middels–høy» blir M.
Provenansen rundes aldri opp.

Det viser seg også i tallene: **81 % unike styrkesett internt**, det laveste av
de seks siste kildene, fordi den moderne troppen beskrives med korte stikkord
(«Allsidighet, disiplin, arbeidskapasitet») der de eldre profilene får hele
setninger. Korpusandelen falt fra 60,4 % til 60,0 %, og grensa blir stående på
0,59 — **en ratchet går ikke ned.** Fallet er kildens egenskap, ikke en feil.

#### La de daterte profilene datere de udaterte

43 av 100 profiler er udaterte, og Skeid har verken Aalesunds moderne fasit
eller Haugesunds klubbtilhørighet å falle tilbake på: klubben har både et
dynasti på 50- og 60-tallet og en moderne tropp.

Men kilden svarer selv, og svaret er målbart i den. Innenfor hver kategori er
de **daterte** profilene entydige:

| Kategori | Daterte | Dom |
|---|---|---|
| Øverste Skeid-legende | 20 av 20 før 2000 | historical |
| Historisk cup-/gullalderprofil | 25 av 25 før 2000 | historical |
| Sterk samlingsspiller / moderne profil | 8 av 8 etter 2000 | modern |
| **Stor total karriere** | **2 daterte** | **ingen dom** |

Kategorien er altså et datosignal — men bare der kilden har vist det. Regelen
krever minst tre daterte og minst 80 % enighet, og **«Stor total karriere»
klarte ikke det.** Vakten kastet, og den hadde rett: kategorien inneholder både
Braaten, Elabdellaoui og Aleesami *og* Arne Natland fra «en tidlig
landslagsgenerasjon». En majoritet ville datert tre menn feil.

For dem svarer kilden med **ord i stedet for tall** — «en tidlig
landslagsgenerasjon», «en sterk norsk etterkrigsperiode», «historisk
landslagsprofil». Det er like mye kildens egen datering som et årstall, og
teller derfor `belagt`. Andelen belagte epoker gikk fra 31,1 % til **32,8 %**.

Nøyaktig **én** spiller ble stående uten noe signal: Morten Vinje, «15
landskamper og Skeid-spiller». Han står i en **navngitt** unntaksliste i
importen med begrunnelsen i klartekst (den personlige konteksten sier «uten
samme ettertidssynlighet som de største legendene»), merket `utledet`. Blir
siste utvei en stille gren, daterer den hele arver uten at noe sier fra — det
var Aalesund-feilen. Står en ny udatert spiller ikke i lista, kastes det.

#### Navnenøkkelen slettet bindestreken

Importen fant ikke «Pa-Modou Kah», som allerede sto i katalogen, fordi
nøkkelen fjernet bindestreken i stedet for å gjøre den til mellomrom:
`pamodou kah` mot kildens `pa modou kah`. Resultatet ville vært en **duplikat
person** — den dyreste feilen i denne katalogen. 29 navn har bindestrek.

Nær-duplikat-vakten ville tatt den i etterkant (ett tegns avstand), men det er
bedre å ikke lage den. Samtidig translittereres de slaviske tegnene katalogen
faktisk inneholder: uten det ble «Dočkal» til `dokal`, altså en bokstav som
forsvant sporløst. Målt: ingen nye kollisjoner utover de tre kjente parene med
klubbsuffiks.

Nær-duplikat-vakten fant ett par til, og det er to menn: **Erik Johnsen /
Erik Johansen** — KFUMs keeper mot Skeids landslagsspiss med 39 landskamper fra
gullalderen. Johnsen og Johansen er to ulike etternavn, ikke en stavevariant.

#### Vakten som navnga en klubb

`sim:club-squad` sjekket at en klubb uten bane sier det rett ut — med **Skeid
hardkodet som eksempelet**. Så fikk Skeid bane, og vakten feilet fordi arbeidet
lyktes, ikke fordi noe var galt. Samme utløpte premiss som klubbstatus-andelen
hadde.

Den leser nå dataene: alle 38 klubber uten bane må si det, og alle 22 med bane
må la være. Den andre halvdelen er den som fortsatt består den dagen pyramiden
er komplett — en vakt som bare teller det som mangler, slutter å beskytte når
ingenting mangler.

### Haugesund: fra 0 til 100 navn, og tre klubber på én bane

Haugesund hadde **verken bane eller ett eneste navn** — den siste store norske
klubbhistorien uten noen av delene. Haugesund stadion er lagt inn som sted;
id-en følger konvensjonen og **må verifiseres mot History Gos egen id**.

94 nye navn, 6 koblet på. Kilden setter to rekorder til: **96 % av frasene var
allerede dekket** av de åtte tidligere ordbøkene — bare 15 var nye — og den har
**100 unike kvalitetssetninger for 100 profiler**, med 96 av 100 ferdighetssett
unike etter kartlegging.

To av de nye frasene lukker et ekte hull: `natural_fitness` var én av de fire
ferdighetene ingen spiller bar. «Tilgjengelighet» og «kampberedskap» er nettopp
den ferdigheten, og kilden sier ordet selv. Den ble altså ikke *spist* av en
ordbokoppføring, slik `marking` og `flair` var — den hadde bare aldri møtt en
kilde som sa det. Nå står `decisions` igjen som den eneste med null.

#### Tre klubber, én bane

Kilden behandler **FK Haugesund, SK Haugar og SK Djerv 1919 som én
Haugesund-pool uten å blande dem**: FKH ble stiftet i 1993 av de to
moderklubbene, Haugar nådde cupfinalen i 1961 og 1979, Djerv semifinalen i 1986
og øverste nivå i 1988. Hver profil bærer et eget `Klubb/arv`-felt.

Katalogen kan ikke holde den tredelingen. `clubStatus` er et kart fra *placeId*
til status, og alle tre spilte på samme bane — Haugesund stadion har vært byens
hovedarena siden 1920. Haugar og Djerv finnes heller ikke i seriepyramiden, så
egne steder for dem ville vært å finne opp klubber spillet ikke har.

Ett sted er derfor riktig, men **klubbskillet er ekte informasjon skjemaet ikke
bærer**, og det står her i stedet for å forsvinne stille. Kategorien bærer
mesteparten av det uansett: «Haugar-legende», «Djerv-legende», «Djerv–FKH-bro».

`Klubb/arv` gjør likevel én ting i importen — den daterer. 46 av 100 profiler
har ikke ett årstall, og der sier kilden tilhørigheten i stedet: FKH er etter
1993, Haugar og Djerv før 2000. Det er kildens eget ord, ikke en fallback, og
`eraSource` skiller dem: datert av kilden er `belagt`, utledet av klubben er
`utledet`. Resultat: 63 % moderne, 37 % historisk — som er en klubb med et
moderne toppfotballkapittel og to eldre moderklubber.

#### Fem par på én gang, og to av dem var samme mann

| Par | Dom |
|---|---|
| Morten Konradsen / Morten Ågnes Konradsen | samme mann — slått sammen |
| Bala Garba / Bala Ahmed Garba | samme mann — slått sammen |
| Tor Andreassen / Tor Arne Andreassen | to menn |
| Thore Pedersen / Tore Pedersen | to menn |
| Tor Nilsen / Tore Nilsen | to menn |
| Per Andreas Haftorsen / Per Haftorsen | to menn — **begge fra denne kilden** |

Konradsen er Bodø/Glimt-midtbanespilleren som kom til FKH i senere
eliteserieår, Garba den nigerianske spissen som gikk fra Start til Haugesund og
står med 62 mål på 152 kamper. Begge navneformene er riktige i begge tilfeller,
så den som allerede sto i katalogen beholdes.

Det siste paret er nytt av slaget: **to menn fra samme kilde**, ført hver for
seg av den. Haugars landslagskeeper Per Haftorsen (130 kamper 1967–1978, ti
A-landskamper) mot FKHs forsvarsspiller Per Andreas Haftorsen fra klubbens
første tiår. Vakten kan ikke vite det — posisjon og epoke avgjør, og det er
nettopp derfor hvert par gjennomgås for hånd.

### Aalesund: fra 1 til 90 navn, og en fallback som alltid bet

AaFK hadde bane og **ett navn** — Tor Hogne Aarøy, ført som
`club_profile`/`utledet` enda han er klubbens cupfinalescorer fra 2009. 79 nye
navn, 11 koblet på.

Kilden holder standarden fra Tromsø, Fredrikstad, Start og Odd: **90 unike
kvalitetssetninger for 90 profiler**, og **100 % unike ferdighetssett** etter
kartlegging — det høyeste noen kilde har gitt. **94 % av frasene var allerede
dekket** av de sju tidligere ordbøkene, også det en rekord; bare 19 fraser var
nye. Til gjengjeld skriver den kortere enn Odd — stikkord i stedet for
setninger — og sju profiler ender på to ferdigheter fordi kilden gjentar samme
sak med to ord («Reflekser, reaksjoner», «Markering, duellstyrke»). Å telle dem
som to ferdigheter ville vært den samme pyntingen som usorterte styrkesett.

Nær-duplikat-vakten fant to par, begge samme mann: **Mustafa / Mostafa «Mos»
Abdellaoue** (feilstavet — slått sammen til den riktige stavemåten, slik
Cristian Gamboa ble) og **Sondre Fet / Sondre Brunstad Fet** (begge former
riktige — den som allerede sto i katalogen beholdes, som for Jarstein).

#### Epoken var utledet uten at noe sa det

`era` er en akse i ferdighetsprofilen (`eraProfiles`), altså en påstand om
hvilken fotball spilleren spilte. Importene utledet den av årstall i kilden,
med **`historical` som fallback** når kilden ikke oppga noe.

**46 av 90 AaFK-profiler har ikke ett eneste årstall.** Arven havnet derfor på
**59 % `historical` — for en klubb som kom til øverste nivå første gang i
2002.** Til sammenligning: Sandefjord 1 %, Stabæk 8 %, Fredrikstad 65 % (som er
riktig — ni seriegull mellom 1938 og 1961).

Epoken utledes nå av kildens egne to signaler: årstall i profilen, og
kategorien — «Historisk pioner» og «Historisk overgangsprofil» er de eneste to
kilden selv merker som historiske. Dokumentet sier dessuten rett ut at klubben
rykket opp i 2002 og at spillere fra før 2002 er inkludert *som unntak*.
Resultat: **18 %**, altså de tolv kilden merker pluss fire daterte før 2000.

#### To vakter ble skrevet først, og ingen av dem bet

Den ene målte epokespennet mellom klubbene, den andre korpusandelen. Bitetesten
— datér alle udaterte AaFK-profiler til `historical` igjen — gikk rett gjennom
begge:

| Vakt | Uten fallback | Med fallback gjeninnført | Bet? |
|---|---:|---:|---|
| Spenn mellom arvene | 66 pp | 66 pp | nei |
| Korpusandel `historical` | 42,7 % | 45,7 % | nei |

Spennet står stille fordi Sandefjord og Viking eier ytterpunktene uansett hva
Aalesund gjør, og tre prosentpoeng av korpuset er usynlig. **Én klubbs
epokemiks er ikke synlig i utdataene**, og det finnes ingen riktig fordeling å
måle mot — 59 % er tross alt korrekt for Fredrikstad.

Det som kan måles, er om påstanden er **belagt**. Spillerne har nå `eraSource`,
samme mønster som `classSource` og `clubStatusSource`: 414 `belagt` (kilden
daterte ham) mot 999 `utledet`. Grensa er en ratchet på 28 %, og den er lav med
vilje — 608 spillere står utenfor klubbkildene og har ingen registrert datering
i det hele tatt. Bitetest: 30 belagte satt til utledet feller den på 27,2 %.

Grensen er ærlig: en import som *lyver* om provenansen fanges ikke, like lite
som for `classSource`. Vakten flytter kostnaden dit den hører hjemme — den som
importerer må si hva kilden faktisk sa.

#### Tre ord katalogen ikke fikk bruke

Fire ferdigheter hadde **null** spillere: `marking`, `flair`, `decisions`,
`natural_fitness`. For to av dem var det ikke kildene som manglet, men
ordboka — én oppføring hadde spist ordet:

| Frase | Pekte på | Skal peke på |
|---|---|---|
| «markering» | `duels` | `marking` |
| «improvisasjon» | `chance_creation` | `flair` |
| «uforutsigbarhet» | `chance_creation` | `flair` |

**51 kildeprofiler sier «markering» rett ut**, og ferdigheten sto likevel på
null. Rettelsen ga `marking` 78 spillere og `flair` 7. Der kilden sier begge
deler («Markering, duellstyrke») legges den nye til; der ordet var eneste
grunnlag, erstatter den. `kreativitet` → `chance_creation` blir stående:
katalogens egen aliasliste sier `creativity` → `chance_creation`.

`decisions` (0 kildetreff) og `natural_fitness` (2) står igjen som ekte
kildehull, ikke ordbokfeil.

Første forsøk på reparasjonen tokeniserte hele kilden på nytt og sammenlignet.
Den rekonstruksjonen er ikke tro mot de eldre importene — de brukte andre
ordbokprioriteringer, andre tak og RBKs egen 3-token-regel — så 326 av 384 rader
avvek av grunner som ikke hadde med rettelsen å gjøre. Vakten avviste dem, som
den skulle, men den lot også ekte treff ligge. Andre forsøk bytter bare
ferdigheten som spiste ordet, der kilden sier ordet.

### Odd: fra 0 til 100 navn, og 47 fraser som aldri kom fram

Odd er **Norges eldste fotballklubb** (1894) med tolv cupgull, og hadde verken
bane eller ett eneste arvenavn. Skagerak Arena er lagt inn som sted etter samme
mønster som Marienlyst — id-en følger konvensjonen og **må verifiseres mot
History Gos egen id**; treffer den ikke, er klubben fortsatt spillbar på
grunntroppen, så det blir ingen blindvei.

78 nye navn, 22 koblet på. Kilden er den beste hittil målt på sine egne tall:
**100 unike kvalitetssetninger for 100 profiler**, og **95 av 100 ferdighetssett
unike** etter kartlegging. Den dekker 1894–2025, det lengste tidsspennet noen
kilde har levert, og det ga en frasetype ingen av de andre hadde: setninger om
*datidens* fotball («tidlig kombinasjonsspill», «sterk forståelse for datidens
direkte forsvarsspill»). De beskriver en ferdighet i sin epoke, ikke en annen
ferdighet, så de kartlegges som ferdigheten — epokejusteringen gjør
`eraProfiles` allerede.

**89 % av frasene var dekket** av de seks tidligere ordbøkene.

#### 47 ordbokfraser lagret et alias i stedet for ferdigheten

Katalogen har en `strengthAliases`-liste: tokens som *betyr* det samme som en
ferdighet. `one_v_one` betyr `one_vs_one`, `box_movement` betyr `box_presence`.
Motoren slår dem opp, så en spiller som bærer aliaset får ferdigheten lest.
Ingenting var ødelagt i spillet.

To ting var likevel galt, og begge var usynlige.

**Importene kaster aliaset.** De ender med `.filter((t) => ids.has(t))`, og et
alias er ikke en id. Ordbøkene hadde 47 fraser som pekte på et alias, og
treffet ble derfor filtrert bort til slutt — kilden sa noe om spilleren, og
spillet lagret det ikke. Målt: **12 profiler** hadde mistet en styrke
(Tromsø 8, Start 3, Fredrikstad 1). Nå er ordbøkene kanonisert mot aliaslista,
og tallet er null.

**69 lagrede styrker sto som alias.** Der importen ikke filtrerte, havnet
aliaset i dataene. Det virker — men målingen av unike styrkesett teller
strengene, ikke ferdighetene, så `one_v_one` og `one_vs_one` telte som to
forskjellige ferdigheter. Tallet pyntet på seg selv, nøyaktig som usorterte
sett gjorde det. De 69 er kanonisert, og 11 kollapset mot en form som allerede
sto der.

Kanoniseringen følger **aliaslista**, ikke min egen lesning, med tolv navngitte
unntak der frasen sier noe aliaset ikke sier: «én-mot-én-forsvar» blir `duels`,
ikke `one_vs_one`, som ligger i teknikk-gruppa og handler om å komme forbi
mannen. Å følge aliaset der ville gjort en stopper til en dribler.

`audit:attributes` feller nå et lagret alias direkte. Vakten over den — «alle
styrke-tokens løser til en ferdighet» — godtok begge former, fordi motoren gjør
det, og derfor feilet ingenting på ti importer.

Netto: andelen unike styrkesett gikk fra 55,6 % til 57,0 %. Den ordrike kilden
løftet den, kanoniseringen tok tilbake det som var pynt.

Nær-duplikat-vakten fant tre par, og alle tre var noe:

| Par | Dom |
|---|---|
| Rune Jarstein / Rune Almenning Jarstein | samme mann — slått sammen |
| Fredrik Nordkvelle / Fredrik Lund Nordkvelle | samme mann — slått sammen |
| Sverre Andersen / Sverre Andersen (Odd) | to menn — ført med klubbsuffiks |

De to første er mellomnavn-regelen som Rosenborg-kilden tvang fram, og den
betalte seg her: landslagskeeperen sto ført både med og uten «Almenning».
Den tredje er det reneste tilfellet av samme navn, to menn, hittil — Vikings
Sverre Andersen er keeper med 482 kamper og 41 landskamper, Odds er spiss med
61 mål på 80 kamper mellom 1911 og 1920. **Posisjonen alene avgjør det.**

### Start: fra 2 til 85 navn

Start hadde bane og **to navn** — to seriemesterskap representert ved Erik
«Myggen» Mykland og Svein «Matta» Mathisen. 69 nye navn, 16 koblet på.

Kilden holder samme standard som Tromsø og Fredrikstad: **85 unike
kvalitetssetninger for 85 spillere**, 81 ulike ferdighetssett etter
kartlegging. Og ordbøkene begynner å konvergere — **71 % av frasene var
allerede dekket** av de fem tidligere kildene, mot 0 % da Vålerenga-ordboka
ble skrevet. Det er et fotballvokabular som har satt seg, ikke seks separate.

Nær-duplikat-vakten fanget **Arvid Knutsen / Arvid Knudsen**. Denne gangen er
det to menn: Vikings hurtige ving fra gullperioden og Starts midtbanespiller
med over 200 kamper fram til 1974. Knutsen og Knudsen er to ulike etternavn,
ikke en stavevariant — men vakten kan ikke vite det, og det er nettopp derfor
hvert par må gjennomgås for hånd.

### Fredrikstad: fra 4 til 100 navn

Fredrikstad hadde bane og **fire navn** — ni seriemesterskap og tolv
cupmesterskap representert ved fire spillere. Det var det største avviket
mellom hva en klubb er og hva katalogen visste om den.

75 nye navn, 25 koblet på. Kilden er på høyde med Tromsø: **100 unike
kvalitetssetninger for 100 spillere**, og 98 ulike ferdighetssett etter
kartlegging.

**Nær-duplikat-vakten fant enda en ekte duplikat.** Katalogen hadde «Christian
Gamboa» på Lerkendal som `squad_profile` 79 — Rosenborg-importens stavemåte —
og Fredrikstad-kilden har den riktige, «Cristian Gamboa», som `elite_career`
85. Samme costaricanske høyreback, som spilte for FFK før Rosenborg, West
Bromwich og Celtic. Oppføringene er slått sammen på den riktige stavemåten.
Det er fjerde gang den vakten finner samme spiller lagt inn to ganger, og
tredje gang det er en stavevariant.

### Tromsø: 81 profiler, to byttede posisjoner, og en måling som pyntet på seg selv

Tromsø var den siste malgenererte arven — 38 av 81 på posisjonsmalen. Kilden
er den mest spesifikke i hele arbeidet: **81 unike kvalitetssetninger for 81
spillere (100 %)**, på linje med Vålerenga og bedre enn Rosenborg og
Strømsgodset. Alle 81 fikk styrker lest fra sin egen setning, og arven står
nå på 0 av 81.

**Trettiseks posisjoner var gale, og to av dem var byttet om.** Katalogen
hadde Tore Rismo som keeper og Bjarte Flem som midtbanespiller. Kilden sier
det motsatte, og sier det utvetydig: Flem «reddet straffe i opprykkskampen mot
Moss og var førstekeeper på cupmesterlaget i 1986», mens Rismo var «teknisk
nøkkelspiller» og «målscorer til 4–1 i cupfinalen i 1986». To spillere hadde
byttet rolle med hverandre, og ingen vakt kan se det — posisjon er en påstand
bare en kilde kan avgjøre.

Kilden brukte også **«kant»** der de andre skrev «ving», og posisjonstolkeren
min hadde ingen regel for det. «Høyrekant» og «Venstrekant» falt gjennom til
neste ledd i setningen, så tre spillere fikk sekundærposisjonen sin som
primær. Feilen ble synlig fordi jeg leste gjennom alle 37 endringene i stedet
for å telle dem — det var også slik Rismo/Flem-byttet ble oppdaget.

Malen manglet dessuten **WB** helt. Den ble skrevet for de ti posisjonene de
tidligere kildene brukte, og «vingback» dukket først opp her. Den arver
backmalen: samme krav, mer bane å dekke.

### Målingen som pyntet på seg selv

Etter importen sto styrke-settene på **62,0 %** — det høyeste noensinne. Så så
jeg på den største klongruppen, og den var tolv moderne midtstoppere med
«hodespill, duellspill, posisjonering» — de samme tre ordene fra **tolv
forskjellige klubbkilder**, i ulik rekkefølge.

Rekkefølgen betyr ingenting for utledningen. Den betydde alt for målingen:
settene ble talt som strenger, så `[heading,duels,positioning]` og
`[duels,positioning,heading]` var to «unike» sett. Sorteres settene før de
telles, faller tallet fra 62,0 % til **51,6 %**.

**Ti prosentpoeng av variasjonen var permutasjoner**, og grensene jeg hadde
ratchetet til 0,52 og 0,55 hvilte delvis på den støyen. Det er samme feil som
alias-kanoniseringen ble innført for å hindre, ett ledd lenger ut: en måling
som teller synonymer eller rekkefølge i stedet for spillere.

Grensa er satt på nytt fra bitetester på den ærlige målingen — Tromsø til mal
gir 44,6 %, Vålerenga 41,5 %, Rosenborg 48,0 % — så 0,49 feller alle tre med
2,6 poengs margin. Uniktheten står på **81,8 %** med grense 0,81.

Klontaket er **hevet** fra 12 til 14, og det er en bevisst lettelse: de tolv
midtstopperne er en grense for hva kildene sier, ikke en malimport, og et tak
på 12 ville felt neste ekte import av en midtstopper. Det som faktisk fanger
en malgenerert arv er per-klubb-målingen.

### Lyn: 82 navn, og arven flytter ut av Eliteserien

Lyn er den første klubben utenfor Eliteserien som får arv, og den fjerner en
antakelse som aldri var uttalt: at arv følger tabellplass. Lyn ligger i
OBOS-ligaen og har likevel den femte største historien i katalogen — stiftet
1896, med på å etablere NFF, to seriemesterskap, åtte cupmesterskap, **seks
spillere på OL-bronselaget i 1936**, The Double i 1968 og europeisk kvartfinale
mot Barcelona i 1969.

63 nye navn, 19 koblet på — den høyeste koblingsandelen så langt, fordi Lyn
leverte spillere til nesten alle de andre klubbene i katalogen.

**Banen fantes allerede.** `data/football_clubs.json` sa `ground: "Bislett"`, og
`bislett_stadion` lå i unlocks som *fysisk treningskilde* — hurtighet og
utholdenhet. Den er fortsatt det; treningsunlockene er urørt. Rollen sier nå
begge deler (`historical_club_ground_and_physical_training_source`), og
importskriptet kaster hvis banen den kobles til er en nasjonalarena — det er
regelen om at ett besøk på Ullevaal ikke skal sikre en nasjons beste spillere.

Jørgen Juve og Arne Brustad lå fra før på Gressbanen og Ullevaal. De er Lyns to
største, og først nå er de faktisk plukkbare for klubben som eide dem.

**Nivåbåndets bunn tas i bruk for første gang.** `classTiers` har hatt en
`bredde`-bøtte (75–78) med **én** spiller i seg. Etter konkursen startet Lyn på
nivå sju, og gjenreisningsgenerasjonen — Schneider, Bydal, Sell, Breistøl,
Joakim Pedersen Strand — hører hjemme der. Det er ikke en nedvurdering, det er
divisjonen de faktisk spilte i, og båndet fantes nettopp for dette.

**To navn er utelatt, og det er verdt å si hvorfor.** Kilden anbefaler 84;
importen la inn 82. Mame Alassane Niang og Diego Guastavino står bare i
navnelista i avsnitt 8 og har **ingen posisjon noe sted i dokumentet**. Posisjon
er det mest bærende feltet i datamodellen — den styrer arketyper, roller,
styrker og svake sider — så å gjette den er en påstand om en ekte spiller. De
går inn i det øyeblikket kilden sier hva de spilte.

**To koblinger er usikre, og står som det.** Knut Berg lå som spiss på Aspmyra;
Lyn-kilden identifiserer ham som bror av Harald «Dutte» Berg og som
«balanserende midtbanespiller», så posisjonen er rettet til CM — denne kilden er
den som sier hva han spilte. Kristian Henriksen lå som `utledet` på Sarpsborg
stadion fra Fredrikstad-lista; begge kilder beskriver en «half» fra
1930-tallet med VM i 1938, så de er koblet til én spiller og nivået satt til
`belagt`. Er det to menn, er det den oppføringen som er feil. Samme forbehold
som for Fredrik Thorsen.

John Obi Mikel er Lyns versjon av Martin Andresen-testen: **høyest samlet
karrierenivå i katalogen etter Juve og Ronny Johnsen**, og `short_stay_star` på
Bislett på seks kamper. Matías Almeyda står ved siden av ham på fire.

### Sandefjord: 68 navn, og den siste eliteserieklubben uten arv

Sandefjord Fotball ble stiftet i 1998 som et samarbeid mellom IL Runar og
Sandefjord Ballklubb, og kilden trekker samme grense som for KBK og KFUM:
spilleren må ha representert **Sandefjord Fotballs A-lag**. Prestasjoner for
Runar, Sandefjord Ballklubb eller Eik teller ikke alene.

58 nye navn, 10 koblet på. Klubbens alder gir én konsekvens som ser ut som en
forenkling, men ikke er det: **alle 68 er `modern`**. Epokeaksen skiller ikke
noe her, fordi klubben ikke har noen historisk epoke å skille på. Profilene
skiller seg da på det som faktisk varierer — posisjon, nivå og styrkene lest
fra kildens egne beskrivelser.

**Kilden oppgir sitt eget antall**, og jeg fulgte det: «Den anbefalte
Sandefjord-poolen består av 68 unike herrespillere.» Tre navn står i tabellene
uten å være i poolen — Hugo Keto, Tom Kristoffersen og Per Stensrud — og de er
utelatt. Det er samme disiplin som for Solskjær og KBK: der kilden trekker en
grense, trekker importen den også. (For Molde og Bodø/Glimt sa kilden
uttrykkelig at navn utenfor poolen «bør også inn»; her sier den det ikke.)

To nivåer rettet fra `utledet` 79, begge fordi denne kilden bærer karrieren de
gamle oppføringene manglet: Vadim Demidov til `belagt` 83 (landslag, La Liga,
Bundesliga, MLS) og Jørgen Jalland til `belagt` 81 (31 mål på 75 kamper,
deretter Vålerenga og Rubin Kazan).

**Én kobling er usikker, og står det.** Katalogen hadde en «Fredrik Thorsen» fra
Vålerenga-lista: `utledet` 79, epoke `historical`, og styrker rett fra
spissmalen — altså et bart navn uten karrierepåstand. Sandefjord-kilden
beskriver en spiss som scoret i kvalifiseringen i 2003 og i cupsemifinalen i
2006, altså `modern`. Jeg har koblet dem til én spiller og skrevet inn den
dokumenterte karrieren, fordi katalogen holder én person per navn overalt
ellers, og fordi VIF-oppføringen uttrykkelig ikke påsto noe. Er det to
forskjellige menn, er det denne oppføringen som er feil.

Martin Andresen er den skarpeste testen på at klubbstatus ligger per bane: han
har **høyest samlet karrierenivå** av alle som har spilt for Sandefjord, og
`short_stay_star` på Jotun Arena — tre kamper. Kilden sier det selv.

Med Sandefjord inne har **ingen klubb med bane tom arv**. Null-raden i tabellen
over er borte, og vakten som sjekket den gikk dermed tom. Den er erstattet med
det motsatte kravet — hver klubb med bane *må* stå i tabellen — fordi en vakt
som slutter å ha noe å sjekke, slutter å beskytte.

Den erstatningen betalte seg med én gang: **Lyn var neste import**, og den nye
vakten felte den umiddelbart fordi klubben fikk bane og 82 navn uten at
tabellen nevnte den. Den gamle null-raden ville ikke sagt et ord.

### Klubbstatus hører til klubben, ikke spilleren

Hver arveplass har en `clubStatus` — klubbikon, klubblegende, elitekarriere,
gullalderens kjerne, nøkkelspiller, klubbprofil, akademi/eksport, stjerne med
kortere opphold eller troppsprofil — og et `clubStatusSource` som skiller
**kuratert klubbhistorie** fra **utledet**. 2244 statusoppføringer på 1869
spillere, 1526 belagte og 718 utledede.

Begge er **kart fra `placeId` til verdi**, ikke enkeltverdier:

```json
"clubStatus": {
  "intility_arena": "elite_career",
  "araasen_stadion": "elite_career",
  "kfum_arena": "short_stay_star"
}
```

Feltet var opprinnelig én verdi per spiller, og det holdt så lenge hver spiller
sto på én bane. Det er ikke lenger sant for 180 av dem, og KFUM gjorde det
umulig å late som: en spiller kan ikke være både klubblegende og kortvarig
gjest når statusen bare finnes i ett eksemplar. Alle 774 eksisterende spillere
er migrert, og `clubStatusFor(player, homePlaceId)` er den eneste veien inn —
motoren slår aldri opp en status uten å si *hvilken klubb som spør*. Hundreogto
spillere har i dag ulik status i ulike klubber, og `audit:attributes` krever at
det tallet er større enn null: faller det til null, er migreringen reversert.

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

#### Tre klubber på én bane

Sarpsborg-kilden fylte de 32 navnene opp til **107**, og den holder tre klubber
fra hverandre: Sarpsborg 08 (49), Sarpsborg FK (33) og IL Sparta (10), pluss
kombinasjoner. `clubStatus` er nøklet på **placeId**, og alle tre spilte på
Sarpsborg stadion, så skillet kan ikke ligge i skjemaet. Det er nøyaktig samme
situasjon som Haugesund stadion (FK Haugesund, SK Haugar og SK Djerv 1919), og
det håndteres på samme måte: klubbene står her i dokumentet, statusen står på
banen. Forgjengerklubbenes profiler er `club_legend` — de er legender på
**banen**, som er det statusen faktisk måler.

#### Fire navnesammenfall importen ville koblet feil

Navnenøkkelen stryker kallenavn, og det er riktig for én mann stavet på to
måter. Kilden ga fire tilfeller der det er galt, og hver av dem ville blitt en
**stille feilkobling** — én spiller på to baner, med to menns karrierer:

| Navn | Den ene | Den andre |
|---|---|---|
| Knut Andersen | Skeids forsvarer, cupgull 1947 og 1958 | SFKs spiss, cupgull 1949 og 1951 |
| Einar Andersen | Mjøndalens «Gubbe», spiss og klubbikon | SFKs midtbane på cupmesterlaget 1917 |
| Egil Johansen | Vålerengas «Snapper'n», midtbane | Spartas angrepsspiller, NM-laget 1952 |
| Frode Larsen | Branns historiske høyreving | Sarpsborg 08s keeper i 2012-stallen |

Alle fire står nå med klubbsuffiks, slik katalogen allerede gjorde for Tore
Pedersen (RBK) og Nils Eriksen (Moss). To andre sammenfall — Glenn Roberts og
Erik Jonvik — er **samme mann i to klubber**, og er koblet med vilje; det er den
koblingen katalogen finnes for.

Feilen er bare delvis synlig for vaktene, og det er verdt å være presis om
hvor grensa går. Slettes den ene av to splittede spillere i ettertid, står
låsen igjen og peker i tomme luften, og `sim:club-squad` feller det
(bittestet). Men **oppstår sammenslåingen i importen**, blir det aldri noen
låst id som mangler, og ingenting feiler. Den varianten finnes bare ved å lese
de to kildene mot hverandre, slik Nils Eriksen ble funnet.

### Strømmen: den rikeste prosaen, og den største utelatelsen

Strømmen manglet bane — `ground: "Strømmen stadion"` uten `placeId`. **54 navn**
av kildens 85, og differansen er hele historien om denne importen.

Kilden har den **rikeste prosaen** av alle v2-kildene: den siterer VG- og
klubbomtaler av 2025- og 2026-troppen, og de omtalene er faktiske
ferdighetsbeskrivelser, ikke merittlister — «god med beina», «elegante
dribleferdigheter og et kraftig tilslag», «nesten komplett på nivået, leder,
duellspiller og god med ballen». Resultatet er **100 % unike styrkesett** blant
de 16 som har noen; ingen annen kilde har levert det.

Men den rikdommen gjelder en liten del av arven:

| | |
|---|---:|
| Profiler i kilden | 85 |
| Tynn-markert av kilden selv | 69 |
| Uten posisjon («Historisk utespiller») | 30 |
| Havnet i katalogen | 54 |
| Av dem med dokumenterte styrker | 30 |

**De 30 utelatte er den største utelatelsen så langt, og de tre øverste er
klubbens kamprekordholdere**: Tor Hansen (301 kamper 1945–1965), Rune
Kristiansen (288) og Nils Tømte (279). Kilden oppgir kampantall og årstall for
dem, men aldri hva de spilte. Å gjette en posisjon for klubbens rekordholder er
nøyaktig posisjonsmalen kilden uttrykkelig sier den ikke bruker, så de står
utenfor til en kilde sier hvor de spilte.

Én kobling ble avvist av samme grunn som Finn-Magnus Johannessen: Strømsgodsets
**Robert Pedersen** er en historisk spiss på Marienlyst, Strømmens **Robert Aas
Pedersen** er junior-norgesmester fra 1971 uten oppgitt posisjon. Ingenting
utenom navnet knytter dem sammen, og koblingen ville påstått en karriere kilden
ikke nevner. En ubekreftet kobling er en påstand; utelatelse er det ikke.

### Ranheim: 1950-tallets posisjoner, og en feilkobling importen selv laget

Ranheim er den tredje v2-kilden, og den tredje med sin egen ordlyd på
tynn-markøren: «Ingen teknisk eller fysisk **styrke** fylles utover dette uten
ny individuell kilde» — norsk ord, og uten «skal». 55 av 85 profiler bruker den.
Regexen er derfor generalisert til *formen* i stedet for ordlyden; den var én
ordendring fra å gjøre 55 tynne profiler til udekkede fraser.

Kilden har **ingen fraseliste i det hele tatt**. De 30 som ikke er tynne er
skrevet ut i klartekst og lest én for én. Fem av dem er salg, utlån og «rask
integrasjon» — marked og karriereløp, ikke ferdigheter.

#### 1950-tallets posisjonsnavn er posisjoner

Ranheims storhetstid var Hovedserien 1949–50 og NM-semifinalen i 1953, og kilden
beskriver spillerne slik samtida gjorde: **senterforward**, **høyre half**,
**indre venstre**, **ytre høyre**. Posisjonskartet kjente ingen av dem, og seks
profiler falt ut med nøyaktig samme feil som «Allrounder» ga hos Kongsvinger.

Dette er presise posisjoner i 2-3-5, ikke manglende posisjoner. Med dem på plass
gikk utelatelsene fra ti til fire — og de fire som står igjen er ekte:
«Historisk utespiller» er kildens egen måte å si at den ikke vet.

#### Mellomnavn-heuristikken koblet feil mann

Regelen som fanger «Mathias Dyngeland = Mathias Lønne Dyngeland» koblet også
Ranheims **Finn-Magnus Johannessen** til Fredrikstads **Finn «Jagge»
Johannessen**. Kildene sier rett ut at det er to menn på hver sin side av samme
kamp: FFKs Jagge var angrepsspiller i klubbens første gullalder, mens Ranheims
Finn-Magnus **scoret mot Fredrikstad** i et cupoppgjør.

En slik sammenslåing er den dyreste feilen i katalogen, og ingen vakt ser den i
etterkant. Den ble funnet fordi importen nå **skriver ut hver kobling den
gjør** — heuristikken beholdes, men unntakene står navngitt. Torbjørn Heggem =
Torbjørn Lysaker Heggem er derimot samme mann, og den koblingen er hele poenget.

### Kongsvinger: samme kildeform, og et årstall som ikke var et årstall

KIL delte utgangspunkt med Sogndal — `ground: "Gjemselund"` uten `placeId` — og
deler v2-formen, men ikke tettheten:

| | Sogndal | Kongsvinger |
|---|---:|---:|
| Profiler i kilden | 85 | 85 |
| Kilden avstår uttrykkelig fra en ferdighet | 52 | 16 |
| Med dokumenterte styrker etter import | 25 | 39 |
| Uten posisjon i kilden | 10 | 6 |
| Udatert i historikk og kvaliteter | 49 | 19 |
| Håndsatte epoker | 18 | 1 |

Kongsvinger er altså langt bedre belagt. Det som likevel tømmer 40 av 79
styrkelister er **merittregelen**: «dokumentert cupsemifinaleerfaring» står 25
ganger, og KILs fire cupsemifinaler er lagets merittliste sett fra spilleren,
ikke en ferdighet hos mannen. Taket i `KJENT_UDOKUMENTERT` er 0,52.

#### Et årstall er ikke nødvendigvis et karriereårstall

KIL oppgir kampantall fra **«KILs publiserte adelskalender i 2023»**. Årstallet
er når *lista* ble publisert, ikke når mannen spilte — og epoke-utledningen, som
tar høyeste årstall i kildeteksten, gjorde derfor Charles Berstad til `modern`.
Han var nøkkelspiller i sølvlaget **1992**. Espen Nystuen fikk 2023 som sitt
eneste årstall.

Regelen som luker det bort er smal med vilje: bare årstallet som henger på selve
adelskalenderen strykes. Harald Holter «passerte 214 KIL-kamper i 2023 etter å
ha vært i klubben siden 2015», og *det* er en ekte datering som må overleve.

Rettelsen betalte seg to ganger: da publiseringsåret var borte, klarte «Øverste
KIL-legende» 90 %-terskelen på egen hånd, og håndlista for epoke falt fra tre
navn til ett.

#### «Allrounder» er en posisjon, ikke fravær av en

Arnfinn Engerbakk (266 kamper, sentral mot Juventus) falt først ut fordi
posisjonsfeltet sa «Allrounder». Men kilden sier `Spilte alle posisjoner for
KIL, inkludert keeper mot slutten av karrieren` — det er en påstand *om*
posisjon, ikke en manglende. Han står nå med midtbanemalen og **ingen utvidet
slot-liste**: å gi ham ti brukbare posisjoner ville gjort ham til
universalplasteret for ethvert hull i oppstillingen, og det er en spillmekanisk
påstand kilden ikke gjør. Allsidigheten ligger i `teamwork`, der den hører
hjemme.

De seks som er utelatt er det med rette: to æresmedlemmer, en trener, en
«sr.-generasjon» som ikke er én person, og to historiske utespillere kilden ikke
plasserer.

### Sogndal: den tynneste arven, og hvorfor den likevel står

Sogndal hadde ingen bane i katalogen — `ground: "Fosshaugane Campus"` sto der,
uten `placeId`, akkurat som Strømsgodset før Marienlyst. Stedet er lagt til, og
75 av kildens 85 profiler ligger på det.

Kilden er velformet på formen — 85 unike kvalitetslinjer, 85 unike
svakhetslinjer, null posisjonsmaler — men den er den **tynneste i katalogen**,
og den sier det selv:

| | |
|---|---:|
| Profiler i kilden | 85 |
| Kilden avstår uttrykkelig fra en ferdighet | 52 |
| Bare lagmeritt eller eksportverdi | 9 |
| Med dokumenterte styrker | 25 |
| Uten posisjon i kilden («Historisk utespiller») | 10 |

De ti uten posisjon er **utelatt**. Det er 1964-guttelaget, og kilden vet ikke
hva de spilte; å gjette ville vært posisjonsmalen kilden uttrykkelig sier den
ikke bruker. De ni som bare bærer meritt fikk tom styrkeliste etter regelen
Sarpsborg tvang fram — **åtte av dem har samme evidens, «Startet cupfinalen
1976»**, altså cupfinalelaget ramset opp.

`KJENT_UDOKUMENTERT` måtte derfor settes til **0,68 for Fosshaugane**, langt
over alle andre. Det er høyt fordi hullet er ekte, ikke fordi importen var
slurvete: alternativet var å la Sogndal stå helt uten arv, og 75 navngitte
spillere med riktig posisjon, epoke og nivå er mer enn ingenting. Det som
**ikke** er gjort, er å dikte opp ferdigheter for å pynte på tallet.

Kilden påstår «Ratchet-unntak: nei» i sin egen kvalitetsaudit. Den påstanden
holdt ikke — se `docs/ferdigheter.md`.

Importen er nå **to steg**. Den kanoniske klubbpoolen kom inn mens denne
importen pågikk, og med den er klubbmedlemskap eksplisitt i
`player.clubAffiliations` — det holder ikke lenger å sette `clubStatus` på
banen. Etter importen kjøres `node scripts/sync-club-affiliations.mjs --write`,
som materialiserer tilknytningene og flytter klubben fra `pending` til `ready`
når poolen passerer 15. Sogndal gikk dermed fra `playerPoolSize: 0` til 75.

Tre navn ble nesten til **duplikate personer**: kilden skriver «Mathias
Dyngeland», «Kristian Opseth» og «Kristoffer Haukås Steinset» der katalogen har
«Mathias Lønne Dyngeland», «Kristian Fardal Opseth» og «Kristoffer Steinset».
Navnenøkkelen stryker kallenavn, men ikke mellomnavn. `audit:attributes` fanget
dem etterpå — samme regel som fant Rune Almenning Jarstein — men importen kobler
dem nå selv, så de aldri oppstår.

### Strømsgodset: 143 navn, en helt ny bane, og en vakt som byttet form

Strømsgodset er den første klubben som får arv uten å ha en bane i katalogen fra
før. Klubbdataene har hele tiden sagt `ground: "Marienlyst"`, men det fantes
ingen `placeId`, så arven hadde ingenting å feste seg i. Stedet er lagt til med
id-en de andre banene bruker (`marienlyst_stadion`). **Treffer den ikke History
Gos egen id, er klubben fortsatt spillbar på grunntroppen** — det blir ingen
blindvei, men koblingen bør verifiseres mot History Go.

111 nye navn, 32 koblet på. Martin Ødegaard lå bare på Ullevaal, altså en
nasjonalarena, og var dermed *speidet* og ikke signerbar til en klubbtropp. Med
Marienlyst er han endelig plukkbar for klubben som utviklet ham.

**Kilden leverer klubbstatusen selv**, som den første av alle: en egen
`Klubbstatus`-linje per spiller — «Absolutt klubbikon», «Cupmester og
eksportprofil», «Korttidsprofil». Den er lest direkte inn i `clubStatus` i
stedet for utledet av kamptall og meritter.

**Ett navn står utenfor, og kilden ba om det.** Rolf Halvorsen er ført med
«Uavklart historisk hovedposisjon», og kilden slår fast prinsippet selv: «for
eldre eller svakt dokumenterte spillere er det bedre å skrive at noe er uavklart
enn å dikte». Posisjon styrer arketyper, roller, styrker og svake sider, så en
gjettet posisjon er en påstand om en ekte spiller. Samme avgjørelse som for Lyns
to navn uten posisjon.

**Nær-duplikat-vakten fant fire par på én gang** — som er nettopp det en fersk
arv på 144 navn skal utløse. Tobias Fjeld Gulliksen og Tobias Gulliksen var
samme mann og er slått sammen. De tre andre er ekte forskjellige menn og står
gjennomgått: André Hansen (RBK-keeper) mot André Hanssen (SIF-midtbane), Helge
Karlsen (Brann) mot Helge Widemann Karlsen (SIF), og Bjørn **Odd**mar Andersen
(Brann) mot Bjørn Odmar Andersen (SIF). Det siste paret er én bokstav fra
hverandre og fristelsen til å slå dem sammen var stor — men begge er navngitt av
sin egen klubbkilde med hver sin posisjon, og å smelte to dokumenterte
klubbkarrierer sammen er den ene feilen som ikke kan angres.

### Vakten som målte feil ting, og fant to reelle hull da den ble rettet

Strømsgodset-kilden har **48 unike styrkesetninger for 144 spillere (33 %)** —
samme rollegruppering som Rosenborg. Å importere den senket de to korpusbrede
andelene under grensene jeg akkurat hadde ratchetet opp.

Det var ikke fordi noen malgenererte noe. Det var fordi en stor klubb med tynn
kilde kom inn. **En korpusbred andel kan ikke skille «noen malgenererte en
klubb» fra «en ny klubb har tynnere kilde enn snittet»**, og den blir svakere jo
større katalogen blir. Å senke grensen for å få plass ville vært å gi opp det
den vokter; å beholde den ville felt en ekte kildeimport.

Målingen som faktisk treffer er **per klubb**: en malgenerert arv har spillere
hvis styrker er *bit-identiske* med posisjonsmalen. En ekte kilde treffer den
aldri systematisk, uansett hvor grovt den grupperer.

Den nye vakten fant to reelle hull med én gang:

| Arv | På posisjonsmalen | Etter kildelista |
|---|---:|---:|
| Tromsø | 38 av 81 (47 %) | **0 av 81** |
| Viking | 22 av 70 (31 %) | **0 av 70** |
| alle andre | 0–8 % | uendret |

**Begge kildelistene kom, og gjeldstabellen i vakten står nå tom.** Ingen arv i
katalogen er lenger malgenerert. Taket er 10 % for alle, og en ny klubb importert
på mal feller vakten umiddelbart — bittestet ved å reversere Tromsø, Viking og
KFUM hver for seg.

Retro-fitten som leste styrker inn i de fem første importene dekket bare de
navnene kildene faktisk beskrev — resten ble stående. Tallene står som **tak som
bare kan gå ned**. Bittestet ved å reversere KFUM til mal.

**Viking-lista kom, og taket falt til null.** Kilden beskriver hver spiller for
seg — «dødballspesialist», «rask forsvarsspiller», «hurtig og målfarlig», «en
offensiv og moderne backtype» — så gjelden ble betalt med kilde og ikke med mal.
66 spillere fikk styrker lest fra sin egen setning, fire ble hoppet over fordi
en annen klubbkilde allerede hadde beskrevet dem, og **fire posisjoner var
gale**: Thomas Pereira sto som sentral midtbane der kilden sier venstreback med
433 kamper, Bjarne Berntsen som stopper der kilden sier defensiv midtbane, Hans
Edgar Paulsen som CM der kilden sier offensiv, og Børre Meinseth som venstreback
der kilden sier «rask forsvarsspiller» i midten.

Raden for Viking er fjernet fra gjeldstabellen i vakten i stedet for å bli
stående som et tak ingen trenger — bittestet ved å reversere Viking til mal på
nytt, som nå feller den. **Tromsø er den siste arven uten kildeliste.**

Korpuset løftet seg med: profiluniktheten **77,6 % → 79,1 %**, styrke-settene
**54,1 % → 57,0 %**, og største klon fra 10 til 9. Grensene er ratchetet til
0,78, 0,55 og ≤ 12.

### Rosenborg: 156 navn, og en kilde som beskriver roller, ikke spillere

Rosenborg-arven er den største: 156 navn, fra Odd Iversens 1960- og 70-tall
gjennom Eggens gullrekke 1992–2004 til dagens lag. Den var den siste
malgenererte arven, og kilden kom sist.

**Kilden er målt tynnere enn Vålerengas, og det styrte hele importen.** Den har
samme form — Styrker, Begrensninger og Kildegrad per navn (A: 63, B: 78, C: 15)
— men **42 unike styrkesetninger for 156 spillere (27 %)**, mot Vålerengas 127
av 127 (100 %). Den grupperer etter rolle: tolv offensive backer deler én
setning, elleve allsidige forsvarsspillere en annen.

Det betyr at kilden ikke uten videre er mer spesifikk enn det katalogen
allerede hadde. 26 av de 156 er beskrevet **individuelt av en annen
klubbkilde** — Carew og Steffen Iversen fra Vålerenga-lista, Rushfeldt fra
Tromsø, Hoftun fra Bodø/Glimt. Regelen ble derfor: **den mer spesifikke kilden
vinner.**

Tre strategier, målt før valget:

| Strategi | Unike styrke-sett |
|---|---:|
| Overskriv alle 156 | 56,3 % |
| Bare de malgenererte settene | **59,2 %** |
| Mer spesifikk kilde vinner | 57,8 % |

Den valgte regelen scorer 1,4 poeng lavere enn den beste. Den beste beholdt
sett for spillere der RBK-dokumentet er **eneste** kilde — Roar Strand, Bent
Skammelsrud, André Hansen — og der er katalogens gamle verdier mine, ikke
kildens. Å velge det høyeste tallet ville vært å optimalisere vakten i stedet
for dataene.

**En delt setning gir tre tokens, ikke fem.** Fem forutsetter at kilden beskrev
*spilleren*; her beskriver den ofte *rollen*. Det er ikke kosmetikk: med fem
tokens dekket én delt keeperbeskrivelse hele GK-kravlista, og ni spillere endte
med **under tre svake sider**. `sim:player-weaknesses` felte det. En profil uten
svake sider er nettopp utflatingen hele modellen jobber mot — vakten fanget en
ekte modelleringsfeil, ikke en terskel.

Resultat: profiluniktheten **78,6 % → 79,2 %** og styrke-settene
**56,4 % → 57,2 %**. Mindre løft enn Vålerenga ga, og det er kildens
egenskap, ikke importens. Grensene er ratchetet til 0,78 og 0,55.

**«Rune Jarstein» og «Rune Almenning Jarstein» var samme mann** — Norges
landslagskeeper, ført med mellomnavn på Lerkendal og uten på Ullevaal. Det er
tredje variant av samme feil, og igjen så vakten den ikke: et mellomnavn legger
ti tegn til navnet, så verken ett-tegns-regelen eller klubbsuffiks-regelen slår
inn. Regelen er utvidet med **samme fornavn, samme etternavn, ett navneledd i
forskjell**. Den flagger fem ekte forskjellige menn i tillegg — Morten Gamst
Pedersen mot Morten Pedersen, Marcus Holmgren Pedersen mot Marcus Pedersen, Tom
Helge Jacobsen mot Tom Jacobsen mot Tom R. Jacobsen, og Lyns Ole Stavrum mot
Moldes Ole Erik Stavrum — som alle står gjennomgått med begrunnelse. Det er
prisen, og den er riktig vei å ta feil på.

**Én vakt måtte skrives om fordi premissen var utdatert.** `audit:attributes`
krevde at kuratert klubbstatus var **under 50 %** av alle statusoppføringer,
ellers var «belagt» en tom merkelapp. Med elleve klubbarver lest fra kilder som
dokumenterer status passerte andelen 50 %, og vakten felte arbeidet den skulle
beskytte. Et tak som utløses av at jobben lykkes måler feil ting. Kravet er nå
at **skillet lever**: begge verdier i reell bruk, hver på minst tre baner. En
blankt omdøpt katalog feller den fortsatt — bittestet begge veier.

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

### Klubbene som en periode sto uten navn

Fire klubber sto lenge med bane og ingen navn: HamKam, Kristiansund, KFUM og
Sandefjord. Begrunnelsen var at oppslagene ikke ga noen pålitelig legendeliste,
og at et halvhusket navn med gal posisjon er verre enn et ærlig «ingen
historiske spillere i katalogen ennå». Alle fire er nå kartlagt fra kilder —
26, 49, 66 og 68 navn — og raden finnes ikke lenger.

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

## Klubbpool v1: medlemskap og tilgang

Klubbmedlemskap, History Go-oppdagelse og stadiontilgang er tre forskjellige fakta.
`player.clubAffiliations` bestemmer hvilken klubbpool spilleren tilhører.
`player.sourcePlaceIds` bestemmer bare hvor spilleren kan oppdages i History Go.
`club.homePlaceId` bestemmer hvilket stadionbesøk som åpner hele klubbpoolen.

En klubb kan bare overtas når den har minst 15 dokumenterte spillere i sin egen
pool. Uferdige pooler står som `pending` og fylles aldri med tilfeldige spillere
fra andre klubber. Gamle automatiske grunntropper repareres mot den valgte
klubbens canonical pool ved lasting, slik at eldre saves ikke beholder fremmede
spillere etter migreringen.
