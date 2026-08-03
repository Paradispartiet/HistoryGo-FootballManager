# Ferdigheter

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Spillet gir nå karakter på 42 ferdigheter per spiller, på skalaen 1–20. Det ser
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
2. **Klassen er posisjonsavhengig.** Tallet manageren ser regnes ut mot
   posisjonen han står i. Ødegaard er 85 som AM, 78 som CM, 46 som CB og 42 som
   spiss. Da finnes det ingen kolonne å sortere troppen etter, og rangeringen
   dør **strukturelt** i stedet for ved regel.

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
åpenbart ferdigheter også. Katalogen står nå på **42**, i fire kategorier:

| Kategori | Antall | Hva den beskriver |
|---|---:|---|
| fysisk | 9 | Kroppen han har |
| teknisk | 13 | Det han kan med ballen |
| taktisk | 14 | Det han forstår uten ballen |
| mental | 6 | Hodet han spiller med |

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
| Klasse i egen posisjon | sprer seg 64–93 |
| De 204 spillerne som alle sto på 87 | fordeler seg nå på **22 ulike verdier** |

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

`sim:player-attributes` (1947 sjekker) — sprik, skalabruk,
posisjonsavhengighet, at klassehøyde ikke avgjør, at klassebonusen varierer per
rolle, og at ingen `belagt`-verdi mangler dekning i kilden.

Fire bitetester, alle bekreftet:

| Gjeninnført feil | Fanget av |
|---|---|
| Klemming i stedet for normalisering | «under 4 % på taket» (ga 5,0 %) |
| Flat klassebonus som før | «matchScore lar lavere klassehøyde vinne» |
| Alias peker på ferdighet som ikke finnes | `audit:attributes` |
| Oppdiktet `belagt`-påstand | provenance-sjekken mot `strengths` |
