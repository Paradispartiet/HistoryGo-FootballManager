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
