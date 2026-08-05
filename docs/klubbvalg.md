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
| Strømsgodset | Marienlyst stadion | 143 |
| Vålerenga | Intility Arena | 127 |
| Fredrikstad | Fredrikstad stadion | 100 |
| Bodø/Glimt | Aspmyra stadion | 89 |
| Molde | Aker stadion | 89 |
| Lyn | Bislett Stadion | 82 |
| Tromsø | Romssa Arena | 81 |
| Brann | Brann Stadion | 75 |
| Stabæk | Nadderud | 75 |
| Viking | Lyse Arena | 70 |
| Sandefjord | Jotun Arena | 68 |
| KFUM Oslo | KFUM Arena | 66 |
| Lillestrøm | Åråsen | 56 |
| Kristiansund | Nordmøre stadion | 49 |
| Sarpsborg 08 | Sarpsborg stadion | 32 |
| HamKam | Briskeby | 26 |

| Start | Sparebanken Sør Arena | 2 |
| Aalesund | Color Line Stadion | 1 |

**Alle 16 eliteserieklubbene har bane**, pluss Stabæk, Lyn og Strømsgodset —
1387 arveplasser fordelt på alle 19. **Ingen klubb med bane står uten navn.** De 41 klubbene som
mangler bane sier det rett ut i profilen i stedet for å late som.

Arven er ikke lenger et eliteserieprivilegium: Strømsgodset og Lyn ligger begge
i OBOS-ligaen og har henholdsvis den nest største og den sjette største arven i
katalogen. Det er riktig — arv er klubbens historie,
ikke dens tabellplass i dag.

Summen er *plasser*, ikke personer: 169 spillere står på to eller flere baner
fordi de faktisk spilte begge steder, og teller derfor hos hver klubb.

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
**kuratert klubbhistorie** fra **utledet**. 1415 statusoppføringer på 1191
spillere, 911 belagte og 504 utledede.

Begge er **kart fra `placeId` til verdi**, ikke enkeltverdier:

```json
"clubStatus": {
  "intility_arena": "elite_career",
  "araasen_stadion": "elite_career",
  "kfum_arena": "short_stay_star"
}
```

Feltet var opprinnelig én verdi per spiller, og det holdt så lenge hver spiller
sto på én bane. Det er ikke lenger sant for 169 av dem, og KFUM gjorde det
umulig å late som: en spiller kan ikke være både klubblegende og kortvarig
gjest når statusen bare finnes i ett eksemplar. Alle 774 eksisterende spillere
er migrert, og `clubStatusFor(player, homePlaceId)` er den eneste veien inn —
motoren slår aldri opp en status uten å si *hvilken klubb som spør*. Nittito
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
