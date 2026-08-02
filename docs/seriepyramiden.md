# Seriepyramiden

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Det samme gjelder karrieren: den skal ha et sted å gå. En manager som spiller
samme nivå mot samme sytten motstandere sesong etter sesong har ikke en karriere,
han har en løkke.

## Slik seriene faktisk spilles

| Nivå | Serie | Klubber | Runder | Opp | Ned |
|---|---|---:|---:|---|---|
| 1 | Eliteserien | 16 | 30 | — (seriegull) | 2 direkte + 1 kvalifisering |
| 2 | OBOS-ligaen | 16 | 30 | 2 direkte + 1 kvalifisering | 2 direkte + 1 kvalifisering |
| 3 | 2. divisjon | 28 (2 × 14) | 26 | avdelingsvinner + kvalifisering | bunnen (ingen 4. nivå i spillet) |

60 klubber i `data/football_clubs.json`. Sammensetningen er et øyeblikksbilde av
2026-sesongen; opp- og nedrykk i spillet flytter manageren mellom nivåene uten at
fila endres.

**Klubben eier identitet og nivå** (navn, bane, by, styrke). **Profilen eier
fotballen** (`data/football_league_club_profiles.json`). Det skillet er ikke
kosmetisk — se «Etiketten som løy» nedenfor.

## Terminlisten: feilen som ville blitt fjorten strake

Den gamle terminlisten ga **hver klubb sju strake bortekamper og så sju strake
hjemmekamper**. Det er ikke en serie, det er to turneringer. Ingenting sa fra:
tabellen summerte riktig, hvert par møttes to ganger, hver klubb spilte én kamp
per runde. Ingen vakt så på *rekkefølgen*.

Feilen lå i hjemme/borte-regelen:

```js
if ((round + index) % 2 === 0) [homeClubId, awayClubId] = [awayClubId, homeClubId];
```

Sirkelmetoden roterer alle lag unntatt det på plass 0. `index` betyr derfor noe
helt annet for et lag som flytter seg gjennom rotasjonen enn for det faste. Målt
med 16 klubber ble strekket **fjorten kamper**.

Rettingen: hjemme/borte settes på det faste laget etter rundeparitet og på resten
etter parets plass, og returrunden roteres én runde før den legges på (ellers blir
skjøten mellom halvsesongene et dobbelt strekk). Målt gir det **lengste strekk på
2 kamper** for 8, 14 og 16 klubber, og ingen møter samme motstander to runder på
rad.

Dette er samme klasse som skalafeilene i CLAUDE.md: koden så riktig ut, og bare en
**måling** avslørte den. `longestVenueRun()` er derfor eksportert fra motoren —
den er en måling, ikke en detalj, og vakten kjører den på hver klubb på hvert nivå.

## Etiketten som løy

Den korte stil-etiketten spilleren ser først (`tacticalIdentity`) bodde på
klubben — altså i en **annen fil** enn fotballen den beskrev. De drev fra
hverandre: Lillestrøm sto med «raske vendinger» i klubblista lenge etter at
profilen var rettet til langball og dueller.

Etiketten heter nå `shortLabel` og bor i profilen. Én kilde, ingen drift. Vakten
avviser `tacticalIdentity` på klubbdata, så duplikatet ikke sniker seg tilbake.

## Tradisjon eller karakter

Alle 16 eliteserieklubbene har profil. Men de er ikke like: noen har en
storhetstid med dokumentert fotball, andre har aldri vunnet noe.

`styleBasis` sier hvilken det er:

- **`tradisjon`** (12 klubber) — en storhetstid med fotball som lar seg slå opp.
  Fredrikstads «wienerstil», Bodø/Glimts fire gull på 4-3-3 med 60 % ball,
  Starts profesjonalitet i 1978/80.
- **`klubbkarakter`** (4 klubber) — KFUM, Kristiansund, Sandefjord, HamKam. Ingen
  titler, ingen taktisk tradisjon å slå opp. Da er det ærligere å beskrive hva
  klubben faktisk **er** — Oslos minste eliteserieklubb med egne unge spillere;
  klubben som holder seg oppe på ren organisering — enn å dikte opp en tradisjon.

Vakten krever at en `klubbkarakter`-profil **sier det i notatet sitt**. Ellers
ville lesing av profilen ikke kunne skille et oppslag fra en påstand.

## Vaktene

`audit:clubs` (632 sjekker) på pyramiden:

- nivåene er sammenhengende fra 1, og peker på hverandre **begge veier** — rykker
  du opp fra B til A, må A kunne sende deg ned til B igjen
- opprykk peker oppover, nedrykk nedover, begge på nivåer som finnes
- opp- og nedrykksplasser overlapper ikke i tabellen
- runder = (avdelingsstørrelse − 1) × 2, og hver avdeling er nøyaktig full
- klubbstyrke ligger i nivåets bånd
- klubbdata har **ingen** stil-felter (`tacticalIdentity`, `matchupStyles`,
  `styleName`, `styleTraits`, `archetypeId`) — de hører i profilen
- **hver** klubb i pyramiden har profil — ikke bare toppnivået

`sim:league-season` spiller pyramiden:

- 16 lag, 30 runder, 240 kamper, alle 16 spillestil-tokens i bruk på én sesong
- **hvert nivå** målt for seg: en hel sesong i OBOS og i 2. divisjon gir like
  mange ulike stiler som det er motstandere
- unike spillestiler og unike matchupStyles-sett **per avdeling** — det er der du
  møter alle to ganger; to klubber i hver sin divisjon deler aldri en sesong
- de avledede styleTraits sprer seg minst 30 poeng over pyramiden
- lengste banestrekk ≤ 2 på hvert nivå, ingen møter samme motstander to runder på rad
- hver plassering på hvert nivå har en dom, og antallet opp-/nedrykksplasser
  stemmer med pyramidens egne regler
- hele stigen spilt: vinn alt fra 2. divisjon → OBOS → Eliteserien; tap alt fra
  Eliteserien → OBOS

En avdeling med 15 klubber feiler ikke høylytt. Den feiler ved at et opprykk
lander på et nivå som kaster sesongen — midt i en karriere.

## Hele pyramiden spiller sin egen fotball

Alle 60 klubbene har spillestilprofil, ikke bare toppnivået.

Første forslag for de lavere nivåene var **generiske «stilfamilier»**: et lite
sett divisjonsstiler klubbene kunne peke på. Det var feil, og det ble sagt fra om
det. Klubbene der nede har storhetstider også:

- **Moss** vant serien i 1987 — under Nils Arne Eggen.
- **Stabæk** vant i 2008 med det som ble regnet som landets peneste fotball.
- **Strømsgodset** vant i 1970 (Eggen selv) og 2013 (Deila, som har sagt at det
  meste han kan om fotball kom fra Eggen). Godset er den andre greina på
  godfot-treet.
- **Lyn** vant serien i 1964 og 1968 og cupen i 1967 og 1968, midt i det NFF
  kaller Oslo-fotballens storhetstid.
- **Skeid** har åtte cupgull mellom 1947 og 1974 — nesten alt i cup, nesten
  ingenting i serien, som sier noe ekte om laget.
- **Odd** er Norges eldste klubb og har tolv cupgull, delt rekord med Rosenborg
  og Fredrikstad.

Storhetstid-regelen gjelder altså hele pyramiden. 23 klubber har `tradisjon`, 37
har `klubbkarakter`.

### styleTraits avledes, ikke settes for hånd

For de 44 nye klubbene beregnes `styleTraits` **fra `matchupStyles`** via en
tokenvekttabell. 44 × 9 håndsatte tall ville vært falsk presisjon, og verre: de
ville drevet fra fotballen de skal beskrive.

Målt over alle 60 klubbene spenner de avledede tallene 37–66 poeng
(`possessionControl` 23–89, `shortBuildUp` 23–87). Vakten krever minst 30 poengs
spenn — det er nøyaktig den målingen som ville avslørt en generisk stilfamilie,
der alle klubbene lander på midten og ingenting beskriver noe.

## Kvalifiseringen

En kvalifiseringsplass er en **plass, ikke en dom** — så manageren spiller den.
Før dette var `promotion_playoff` en streng uten kamper bak seg: 3. plass i OBOS
betydde nøyaktig det samme som 4., og 14. i Eliteserien det samme som 13.
Ingenting feilet; det skjedde bare ikke noe.

`src/football-league-playoff.js` eier progresjonen. Som serien, mini-sesongen og
mesterskapet simulerer den **aldri managerens egen kamp** — den tar imot
Kampdag-resultatet og bestemmer hva som skjer videre.

**Formatet er det norske:** to kamper, sammenlagt.

- **Utfordreren nedenfra** åpner hjemme og avslutter borte.
- **Den som forsvarer plassen** åpner borte og avslutter hjemme — det er en reell
  fordel, og den må ligge riktig vei.
- Likt sammenlagt → **bortemål**. Fortsatt likt → **straffer**, avgjort på seed
  så en omlasting aldri endrer utfallet.

**Hvem møter du?** Managerens egen serie er den eneste som spilles, så motparten
velges fra nabonivået — der den faktisk ville kommet fra. Skal du opp, møter du
**bunnsjiktet** i divisjonen over (det er der 14.-plassen er). Forsvarer du
plassen, møter du **toppsjiktet** i divisjonen under (det er den som har spilt
seg fram). Utvalget er seedet, ikke tilfeldig.

**2. divisjon har to omganger.** Nivået er delt i to avdelinger, så toerne møtes
først; vinneren går videre mot OBOS-ligaen. Antallet ligger i pyramiden
(`playoffRounds`), ikke i motoren.

Og sperren som gjør at det betyr noe: `startNextLeagueSeason` **kaster** hvis
kvalifiseringen står uspilt. Uten den ville plassen stille sluppet manageren forbi
kampene som avgjør nivået hans — nøyaktig den feilen som var der før.

`sim:league-playoff` (70 sjekker) prøver hver vei: begge baneretninger, alle tre
avgjørelsesmåtene i begge retninger, to-omgangs-kvalifiseringen med tapt og vunnet
første omgang, alle fire utfallene mot nivået neste sesong, lagring over
omlasting, og at app.js faktisk spiller kampene i stedet for å hoppe over dem.

## Ikke gjort ennå

- **Å velge en etablert klubb** i stedet for å opprette sin egen. Pyramiden gjør
  det mulig (16 klubber betyr at det er 15 igjen når du tar én), men valget er
  ikke bygget.
