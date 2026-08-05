# Ferdigheter

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Spillet gir nå karakter på 58 ferdigheter per spiller, på skalaen 1–20. Det ser
ut som et ratingspill. Det er det motsatte, og hele dokumentet handler om
hvorfor.

## Hvorfor et tall per ferdighet gjør spillet MER tro mot prinsippet

`overall` **var** ratingen. Ett forfattet tall, og hele spillerens verdi.

Det verste med det var ikke prinsippet — det var at tallet ikke virket. Målt på
katalogen sto **204 av 367 spillere på nøyaktig 87**. 56 % av spillerne hadde
samme tall. Og `overall` traff kampen ett eneste sted:

```js
const classBonus = (player.overall - 85) * 0.55;
```

For de 204 ga det **1,1 poeng** av en kampscore på 100. Tallet var nesten
dekorativt, og skilte ikke mellom spillere det påsto å rangere.

En profil på 42 akser gjør to ting et enkelttall ikke kan:

1. **Det finnes ikke lenger ett tall.** En spiller er 42 verdier som spriker
   (median 16 av 20 mellom høyeste og laveste). Han er 18 i hodespill og 6 i
   akselerasjon — det sier hva han **er**, ikke hvor god han er.
2. **Det lages aldri en ny samlescore av dem.** Ferdighetene *er* scoren.

### Den feilen vi gjorde først

Første utgave hadde `deriveClassForPosition()`: ferdighetene vektet etter
posisjonens krav, ett tall ut. Tanken var at en posisjonsavhengig score ikke er
en rating, siden samme spiller får ulikt tall ulike steder.

Den var feil, og den ble fjernet. Et posisjonsvektet snitt **er** en samlescore
— å gjøre den posisjonsavhengig fjerner ikke ratingen, den lager én rating per
posisjon. Og verre: den ga **«Ødegaard som midtstopper = 46»**, et lavt tall i
en posisjon han aldri skal spille. Ødegaard er ikke «en 46». Han har 20 i siste
pasning og 20 i spilleforståelse, overalt, alltid.

Det manageren trenger å vite om en plassering er ikke et snitt, men **hvilke
konkrete ferdigheter posisjonen krever og hvor han står på dem**:

> CM krever i tillegg posisjonering (10), duellspill (9), sene løp (8) — se om
> systemet ditt dekker det.

Det er et faktum om ferdigheter. Det forklarer feilbruk uten å felle en dom over
spilleren, og det er den eneste formen posisjonen får lov til å ta.
`describePositionDemands()` returnerer ferdigheter med tall og **aldri et
sammendrag**; vakten faller hvis noen legger `class`, `score` eller `rating` på
den.

Det eneste tallet som måles mot en *bruk* av spilleren er **fiten** — om
treneren bruker ham riktig — aldri en ny rating av ham.

`overall` er borte fra dataene. Feltet heter nå `classHeight` og er en **input**
til profilen — hvor høyt kilden bærer spilleren — aldri en score. Et felt som het
`overall` og ikke lenger var det, ville drevet; huset har blitt bitt av akkurat
det før (`inheritedStyleName` ble satt og aldri lest).

## Katalogen fantes allerede

Ferdighetsvokabularet var ikke nytt. Det lå i `football_player_weaknesses.json`
som 32 attributter med norske navn, kategori og treningsvanskelighet — det var
bare **binært**: du hadde `crossing` i `strengths`, eller ikke.

**81 % av spillernes styrke-tokens var allerede attributt-ider.** De 18 som ikke
var det (`tackling`, `interceptions`, `strength`, `agility`, `leadership` …) var
åpenbart ferdigheter også. Katalogen står nå på **58** — samme størrelsesorden som FM — i fire kategorier:

| Kategori | Antall | Hva den beskriver |
|---|---:|---|
| fysisk | 13 | Kroppen han har |
| teknisk | 15 | Det han kan med ballen |
| taktisk | 15 | Det han forstår uten ballen |
| mental | 15 | Hodet han spiller med |

De 16 som kom til i runde to er FM-standarden som manglet: markering, langskudd,
dødball, aggressivitet, foregripelse, mot, konsentrasjon, beslutninger,
vinnervilje, lagarbeid, arbeidskapasitet, balanse, hoppstyrke, toppfart,
naturlig form og frekkhet.

## Posisjonsprofilen — den ekte forskjellen

`category` sier hva slags ferdighet noe er. Den sier ikke hvilken **jobb på
banen** den hører til, og det er jobben som avgjør hva en spiller uten belagt
kilde skal ha. Hver ferdighet har derfor også en `group`:

| Gruppe | Antall | |
|---|---:|---|
| forsvar | 11 | takling, markering, dueller, hodespill, mot … |
| hode | 10 | beslutninger, konsentrasjon, lagarbeid, vinnervilje … |
| teknikk | 9 | førstetouch, dribling, pasningsregister, dødball … |
| angrep | 8 | avslutninger, boksnærvær, løp i bakrom … |
| fysikk | 7 | toppfart, styrke, balanse, hoppstyrke … |
| kreativitet | 6 | spilleforståelse, siste pasning, frekkhet … |
| gk | 4 | skuddredninger, reflekser, styring av feltet … |
| bredde | 3 | overlappsløp, kantstøtte, isolasjonsspill |

`positionProfiles` vekter hver jobb 0–100 per posisjon, og **det er grunnlinja
hver eneste ferdighet får før spillerens egne styrker legges på**.

Uten den fikk alt spillet ikke hadde kilde på nøyaktig samme tall: **21 % av alle
verdier lå på gulvet**, og en offensiv midtbanespiller hadde like «ukjente»
forsvarstall som en midtstopper. En tier har ikke ukjente forsvarstall. Han har
lave.

| Målt over hele katalogen | | |
|---|---:|---:|
| Forsvarsarbeid, CB mot AM | 15,4 | 6,9 |
| Kreativitet, AM mot CB | 15,9 | 6,9 |
| Angrepsspill, ST mot CB | 16,7 | 5,6 |
| Keeperspill, GK mot ST | 17,8 | 4,8 |

Ødegaard leser nå slik han skal: takling 9, markering 9, hodespill 8,
blokkeringer 8 — og spilleforståelse 20, siste pasning 20, førstetouch 19.
Strandberg omvendt: hodespill 20, duellspill 20, blokkeringer 18, men
spilleforståelse 6.

Dette er påstander om **posisjoner**, ikke om personer. At en offensiv
midtbanespiller takler mindre enn en midtstopper er allmenn fotball, ikke en dom
over en navngitt spiller — og det er nettopp derfor det kan utledes uten kilde
per spiller.

### Marginene i vakten er målt, ikke gjettet

Vakten som måler dette sto først på «+3». Bitetesten som ga tieren
midtstopperens forsvarsvekt slapp rett gjennom: AM-snittet steg fra 6,9 til
10,2 mens CB lå på 15,4, og 15,4 > 10,2 + 3. Auditen fanget datafeilen, men
denne vakten påsto å måle utslaget på ekte spillere og gjorde det ikke.
Grensene står nå like under de ekte avstandene (8,5 / 9,0 / 11,1 / 13,0).

### Svakhet måles bare der den betyr noe

Første utgave av «svakest» viste at Ghayas Zahid er dårlig til å redde skudd.
Sant, og fullstendig ubrukelig. En utespiller som ikke redder skudd er ikke svak,
han er utespiller. Svake sider rangeres nå bare blant grupper som veier minst 25
for posisjonen hans, så lista er ting manageren faktisk kan gjøre noe med:
kantstøtte 7, hodespill 7, avslutninger 7.

Vokabularet bor nå i **`data/football_attributes.json`**, ikke i svakhetsfila.
Den fila eide to ting samtidig; nå eier den bare **treningen** av ferdighetene.
Det er husregelen om at ingen funksjon skal finnes to steder.

`strengthAliases` binder eldre skrivemåter til kanoniske ider (`reading_game` →
`game_reading`, `power` → `strength`). Uten den ville en rolle som krever
`short_passing` aldri møtt en spiller som har `simple_passing`.

## Form og nivå er to akser

`strengths` og posisjonen sier hva en spiller er god **til**. De sier ingenting
om hvor høyt det rekker — og i første utgave var det alt som fantes.

Ghayas Zahid og Martin Ødegaard har begge `vision` og `final_pass` blant
styrkene sine. Begge fikk derfor **20**. Katalogen kunne skille en tier fra en
stopper, men ikke en eliteseriespiller fra en landslagskaptein. `classHeight` lå
som et lite additivt ledd inne i formen og druknet fullstendig.

`classHeight` setter nå **taket**, multiplikativt på hele profilen. Formen
bevares — Zahid er fortsatt en skapende midtbanespiller — men den når ikke like
høyt:

| Spiller | classHeight | Toppferdighet |
|---|---:|---:|
| Ghayas Zahid | 90 | 16 |
| Martin Ødegaard | 96 | 18 |
| Erling Haaland | 98 | 19 |
| Cruyff, Pelé | 99 | 20 |

Bare `classHeight` 98+ når 20. Det er vaktet.

### Bare oppsiden røres

Taket komprimerer mot et **proff-midtpunkt** (10), og bare verdier *over* det.
En lavere klasse gjør ikke svake sider mindre svake — en eliteseriestopper og en
verdensstopper har begge dårlig avslutning; forskjellen ligger i taklingen.

Begge feilene ble målt før de ble rettet. Komprimering mot **gulvet** la 67 % av
alle verdier på 4–7, og katalogen leste som om alle var middelmådige. Komprimering
**begge veier** samlet 34 % på nøyaktig 9, og profilene sluttet å sprike.
Midtpunktet ble valgt ved å måle 7, 8, 9 og 10: største bøtte 26,7 / 27,5 / 23,1
/ **18,5 %**.

### Marginene måtte måles på nytt

Taket senker toppene, så posisjonsavstandene krympet fra 8,5 / 9,0 / 11,1 / 13,0
til **6,0 / 6,2 / 8,0 / 9,5**. Vaktene som målte dem ble satt på nytt og
bittestet på nytt. En margin som ikke følger med en slik endring slutter å bite
uten at noe feiler — og det er den stilleste feilen som finnes.

### Nivåene er satt per spiller

Motoren var på plass, men dataene sa fortsatt at Zahid lå over 74 % av
katalogen. Verdiene var malgenerert — 87 for grunntroppen, 88 for klubbspillere,
90 for elite, 93 for legender — og beskrev sjiktet malen plasserte dem i, ikke
karrieren de faktisk hadde.

Alle 367 er tiered på nytt, mot et bånd som betyr noe:

| Nivå | Bånd | Kriterium |
|---|---|---|
| `all_time` | 97–99 | Blant de aller største gjennom tidene |
| `verdensklasse` | 92–96 | Verdensklasse i sin tid |
| `landslag` | 87–91 | Etablert landslagsspiller / stor liga |
| `eliteserie_topp` | 83–86 | Toneangivende i Eliteserien / klubblegende |
| `eliteserie` | 79–82 | Solid toppdivisjonsspiller |
| `bredde` | 75–78 | Begrenset fotavtrykk i toppen |

Stigen leser nå slik den skal:

| | Nivå | Toppferdighet |
|---|---:|---:|
| Pelé, Cruyff | 99 | 20 |
| Erling Haaland | 97 | 19 |
| Martin Ødegaard | 95 | 18 |
| Rune Bratseth | 92 | 17 |
| Jan Åge Fjørtoft | 89 | 16 |
| Roar Strand | 86 | 15 |
| Ghayas Zahid | 81 | 14 |
| ukjent grunnspiller | 79 | 13 |

### `classSource`: belagt eller utledet

Samme regel som for ferdighetene selv. **162 nivåer er `belagt`** — spillerens
karriere er allment kjent og plasserer ham. **205 er `utledet`**: kilden rekker
ikke til en karrierepåstand, og nivået er avledet av signalet som allerede lå i
dataene (malens eget skille mellom grunn, klubb, elite og legende), komprimert
inn i det nye båndet. Det legger ingen ny påstand til; det bevarer den som fantes.

**167 spillere deler nivå 79.** Det er ærlig, ikke slurv: det er
grunntroppsspillerne malen aldri skilte fra hverandre, og vi har ingen kilde som
gjør det. Profilene deres skiller seg fortsatt fullstendig — på **form**, som er
det posisjon og styrker faktisk sier noe om.

### Båndet leses, det hardkodes ikke

`classCeilingFactor` sto på `(ch - 85) / 14` mens nivåene lå i 86–99. Da
spillerne ble tiered til 78–99, ville alt under 85 blitt **klemt til null** — og
et klem som alltid biter ser ut som en grense og er en skala-mismatch.

Båndet leses nå av korpuset. Vakten mot dette måtte skrives om: første utgave
sjekket bare at faktoren var større enn null, og et hardkodet bånd **består** den,
fordi klemmingen skjuler seg selv. Det som avslører den, er at nivåene *under*
det gamle båndet må skilles fra hverandre — klemmes de, kollapser 78–84 til én
eneste faktor. Bittestet.

## Epoken er en akse

`era` sto på hver eneste spiller og ble aldri lest av ferdighetsmotoren. Det
kostet, og klubbimportene gjorde det synlig: posisjonsmal + nivå ga spillere med
samme posisjon og samme nivå **bokstavelig talt identiske profiler**. Målt på 528
spillere delte **333 profil med minst én annen**, og den største identiske gruppa
var på **26**. Å velge mellom dem var meningsløst.

`eraProfiles` justerer jobbvektene etter epoke. Press, arbeidskapasitet og
lagarbeid er systematisert i moderne fotball, og atletikken er en annen — mens
den tekniske og kreative individualisten hadde mer plass før. Som
posisjonsprofilen er dette en påstand om **epoken**, ikke om en navngitt spiller.

| | Før | Etter |
|---|---:|---:|
| Unike profiler | 265 av 528 | **310 av 528** |
| Største identiske gruppe | 26 | **15** |
| Største verdibøtte | 22,9 % | **18,1 %** |

Det som gjenstår er en ekte begrensning i kildene, ikke en feil. Vakten måler nå
uniktheten direkte i stedet for å bruke verdifordelingen som proxy — og den fyrte
allerede ved neste import.

### Vakten fyrte, og fasiten var i kilden

Tromsø-importen dro uniktheten fra 58 % til **54 %**, under grensa. Roten lot seg
måle presist: 596 spillere delte bare **146 ulike `strengths`-sett**, og det
største ble delt av **52 spillere**. Posisjonsmalen gir hver spiller i samme
posisjon identiske styrker — det er malen, ikke motoren.

Løsningen var ikke å løsne grensa. Kildelistene *beskriver* spillerne — «teknisk
driblekonge», «hurtig og teknisk måltyv», «forsvarsleder», «54 mål på 151
kamper» — og den informasjonen ble kastet ved import. 31 Tromsø-spillere fikk
styrkene lest **rett ut av kildens egne formuleringer**, og uniktheten gikk til
**58 %**.

Det er den generelle fasiten, og den er verdt å skrive ned: **flere ulike
profiler krever mer kildemateriale per spiller, aldri mer oppdiktet variasjon.**
Der kilden beskriver spilleren, skal beskrivelsen inn. Der den ikke gjør det,
skal profilen forbli utledet — og merket som det.

Molde-importen var beviset. Alle 66 nye navn fikk styrkene lest ut av kildens
egne beskrivelser fra start, og uniktheten **steg fra 58 % til 61 %** — den
første importen som ikke fortynnet. Hver tidligere import senket den.

Deretter ble de fem foregående importene gått gjennom på nytt:

| | |
|---|---:|
| Unike ferdighetsprofiler | 405 → **496 av 662 (75 %)** |
| Unike styrke-sett | 192 → **321** |
| Største delte styrke-sett | 52 → **37** |

For Lillestrøm, Viking og Brann var kildetekstene tilgjengelige, og
formuleringene ble lest direkte: «teknisk geni», «arbeidssterk midtbanegeneral»,
«dødballspesialist», «ekstremt hurtig målscorer», «forsvarssjef». For Rosenborg
og Vålerenga fantes bare navnelistene, så der er bare spillere med **allment
kjent karriere** gitt styrker — samme grunnlag som `classHeight` allerede står
på. Resten står fortsatt på malen, og det er riktig: uten kilde skal profilen
være utledet.

### Grensa er en ratchet, og den måtte måles to ganger

Profilgrensa ble flyttet fra 55 % til 70 % da uniktheten var vunnet — en grense
som blir stående lavt beskytter ikke det som er oppnådd.

Men bitetesten avslørte at den fortsatt var for treg: å reversere **én** klubb
til malstyrker koster bare 2 poeng (75 % → 73 %), fordi epoke og nivå fortsatt
skiller spillerne. Den følsomme målingen ligger **oppstrøms**, i styrke-settene
selv — det er nettopp dem en malimport gjør like. Med en egen grense der faller
en enkelt malgenerert klubb umiddelbart.

Begge er ratchetet igjen etter at **Vålerenga-kilden** kom. VIF-arven var den
siste store malimporten utenom Rosenborg, og de to største kollisjonsgruppene i
katalogen — på 34 og 27 spillere — kom begge derfra. Med styrkene lest per
spiller:

| | Før VIF | Etter VIF | Etter RBK | Etter SIF+VIK | Grense |
|---|---:|---:|---:|---:|---:|
| Unike profiler | 73,7 % | 78,6 % | 79,2 % | **79,1 %** | 0,78 |
| Unike styrke-sett | 46,9 % | 56,4 % | 57,2 % | **57,0 %** | 0,55 |
| Største klon | 12 | 10 | 10 | **9** | ≤ 12 |

Strømsgodset senket begge andelene (kilden har 48 unike styrkesetninger for 144
spillere), Viking løftet dem igjen. Netto står de på stedet hvil mens katalogen
har vokst fra 1007 til 1117 spillere — og det er nettopp derfor den
korpusbrede målingen ble supplert med en **per klubb**-måling: den blir ikke
uskarpere av at katalogen vokser.

Bitetesten er å reversere klubben til mal: VIF falt til 74,4 % og 44,4 %, RBK
til 77,2 % og 51,7 %, og vaktene feller begge. Sto grensene der de sto, ville
nøyaktig de reverteringene passert i stillhet.

**Rosenborg ga et mye mindre løft enn Vålerenga, og det er kildens egenskap.**
VIF-dokumentet har 127 unike styrkesetninger for 127 spillere; RBK-dokumentet
har 42 for 156. Det grupperer etter rolle — tolv offensive backer deler én
setning. En delt setning gir derfor tre tokens og ikke fem: med fem dekket én
delt keeperbeskrivelse hele GK-kravlista, og ni spillere endte med under tre
svake sider.  felte det, og det var en ekte
modelleringsfeil, ikke en for streng terskel.

En ting måtte holdes ren for at tallene skal bety noe. Vokabularet har aliaser —
`power` og `physical_presence` peker begge på `strength` — og lagres aliasene
rått, ser styrke-settene mer ulike ut enn de er. Da måler uniktheten **synonymer
i stedet for spillere**. Frasene kanoniseres derfor før de lagres. Det er den
ene måten dette tallet kunne vært pyntet på uten at noe feilet.

## Påstander om ekte spillere

Dette er **367 navngitte fotballspillere**. 42 tall hver er ~15 000
tallpåstander, og median spiller har bare **5 ferdigheter faktisk belagt** i
kilden.

Derfor **utledes** tallene av data som allerede sto der — posisjon, `strengths`,
`archetypes`, foretrukne roller — akkurat som svakhetsmotoren gjør det. Og hver
verdi bærer med seg **hvor den kom fra**:

| `provenance` | Betyr |
|---|---|
| `belagt` | Står i spillerens egne `strengths`. Kilden har sagt dette. |
| `posisjon` | Kommer fra hva posisjonen krever. |
| `rolle` | Kommer fra roller spilleren selv foretrekker. |
| `utledet` | Spillet har regnet seg fram. Vi vet det ikke. |

Sidepanelet viser forskjellen: belagte verdier tegnes tydelig, utledede dempet.
**Det spillet ikke vet, later det ikke som om det vet.**

Sirkelen øverst i profilen viser spillerens **sterkeste ferdighet med navn** —
«20 · Siste pasning» — ikke et sammendrag. Listen under står sortert etter hva
han selv er best til, og er den **samme uansett hvilken plass han står på**.

### Dekning graderes etter vanskelighet

`coveredBy` fantes fra før: har spilleren `box_finishing`, er `finishing` dekket.
Dekningen ga først et flatt løft, og da ble Ødegaard stående på 10 av 20 i
*enkle pasninger* — mens han er belagt elite på *siste pasning*. Det er feil
fotball: er du elite på den vanskelige pasningen, er du ikke middels på den
enkle.

Løftet vektes nå av `difficulty`, som allerede sto i katalogen. Dekker en
**vanskeligere** ferdighet en lettere, teller den fullt ut. Ingenting er funnet
på — den ene datafeltet vekter det andre.

`sim:player-attributes` sjekker hver eneste `belagt`-verdi mot spillerens egne
`strengths`. Finner motoren på en påstand om en ekte fotballspiller, faller
vakten. Bittestet: legger man inn `finishing` som belagt for alle, faller den.

### Realisme er sprik, ikke senking

Vi senket ikke spillerne. Å gi Harry Yven — der kilden bare rekker til
«angrepsspiller» — en sekser i pasningsspill ville vært en tallmessig **dom over
en ekte person** på noe kilden ikke sier noe om.

Realismen ligger i at profilen **spriker**. En targetman med 18 i hodespill og 7
i akselerasjon er realistisk *og* påstår ingenting nedsettende. Gulvet er 4, ikke
1: dette er spillere som har spilt A-lagsfotball.

## Klassebonusen måles nå per rolle

Dette er den viktigste endringen i kampmotoren:

```js
// før: et flatt løft spilleren bar med seg overalt
const classBonus = (player.overall - 85) * 0.55;

// nå: hvor godt treffer ferdighetene hans det NETTOPP DENNE rollen krever
const classBonus = calculateClassBonus(player, role);
```

Spennet er bevisst identisk (0–7,7), så resten av kampscorens kalibrering står.
Men bonusen er ikke lenger noe spilleren eier — den regnes ut på nytt for hver
rolle.

**Det gjør kjerneprinsippet målbart i stedet for påstått:**

| Måling | Resultat |
|---|---|
| Roller der beste rollefit ikke har høyest klassehøyde | **23 av 27** |
| Roller der beste `matchScore` ikke har høyest klassehøyde | **26 av 27** |
| Sprik i profilen, median spiller | **16 av 20** |

En spiller med lavere klasse slår en med høyere når treneren bruker ham riktig.
Det står ikke lenger bare i en kommentar.

## Rollekrav er to ulike ting

`role.requires` blandet **ferdigheter spilleren må ha** (`crossing`, `vision`)
med **forhold systemet må gi ham** (`space_behind`, `wide_lane`,
`compact_midfield`). Målt over de 27 rollene: **96 ferdigheter og 38 forhold.**

Bare de første hører hjemme i en vurdering av spilleren. Forholdene eies av lag-
og relasjonsmotorene — å blande dem ville gjort en **systemsvikt om til en
spillersvakhet**, stikk i strid med prinsippet. `splitRoleRequirements()` skiller
dem, og `role.requiredSkills` løses opp ved innlasting.

## Skalaen er normalisert, ikke klemt

Første utgave la signalene sammen og klemte resultatet inn i 1–20. Målt på ekte
data ga det **776 verdier (5 %) på nøyaktig 20**, og en topp på **2** — som
dessuten er en påstand vi ikke har dekning for.

Det er bugklassen CLAUDE.md beskriver: *et tak som alltid biter er en
skala-mismatch, ikke en grense.* Råtallet normaliseres nå eksplisitt mot spennet
korpuset faktisk bruker, med ytterpunktene kappet på 2./98. persentil — samme
grep som tersilene i klubbtradisjonen. Resultat: **2,8 % på taket**, ingenting
under gulvet.

Vakten står på 4 %, ikke 5 %: bitetesten som gjeninnfører klemmingen lander på
nøyaktig **5,0 %**, så en 5 %-grense ville bestått med null margin.

## Vaktene

`audit:attributes` (539 sjekker) — skjemaet, at hvert alias og hver `coveredBy`
peker på en ferdighet som finnes, at alle 11 posisjoner har rangerte kravlister,
at hvert eneste styrke-token i spillerdataene løser til et tall, at hver rolle
har minst ett ferdighetskrav, og at `overall` er borte fra spillerskjemaet.

`sim:player-attributes` — sprik, skalabruk, **at ingen samlescore finnes**, at
klassehøyde ikke avgjør, at klassebonusen varierer per rolle, og at ingen
`belagt`-verdi mangler dekning i kilden. Vakten leser motoren med kommentarene
strippet: motoren *forklarer* hvorfor samlescoren ble fjernet, og en vakt som
leser prosa ville falt på sin egen begrunnelse.

Fire bitetester, alle bekreftet:

| Gjeninnført feil | Fanget av |
|---|---|
| Klemming i stedet for normalisering | «under 4 % på taket» (ga 5,0 %) |
| Flat klassebonus som før | «matchScore lar lavere klassehøyde vinne» |
| Alias peker på ferdighet som ikke finnes | `audit:attributes` |
| Oppdiktet `belagt`-påstand | provenance-sjekken mot `strengths` |
| Samlescoren gjeninnført i motoren | «ingen posisjonsvektet samlescore» |
| Profilen sortert etter posisjonen igjen | «app.js sorterer etter spillerens egne toppferdigheter» |
