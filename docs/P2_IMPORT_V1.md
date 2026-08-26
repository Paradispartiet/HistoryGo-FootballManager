# P2 · importformen, mekanisert

Pors og Brattvåg ble ført inn for hånd. Med fjorten klubber igjen er
håndarbeidet selv risikoen: hver import gjentar de samme tjue avgjørelsene, og
en av dem blir før eller siden gjort annerledes enn forrige gang uten at noen
ser det. `audit:club-heritage` ble samlet til én tabellstyrt vakt av nøyaktig
den grunnen. `scripts/import-club-heritage.mjs` er samme grep på veien inn.

**Verktøyet flytter ingen grense.** Det er kilden som avgjør hva som står i
katalogen; skriptet gjør bare oversettelsen til canonical form, og stopper i
stedet for å gjette når kilden ikke er entydig.

---

## Kildefila

Et menneske fyller den ut med kilden åpen. Skriptet leser den og skriver aldri
noe som ikke står der.

```json
{
  "clubId": "bjarg",
  "clubName": "Bjarg",
  "placeId": "stavollen_kunstgress",
  "placeName": "Stavollen kunstgress",
  "placeNotes": "Klubbanlegg: …",
  "eraSource": "belagt",
  "doc": "docs/P2_BJARG_SOURCE_PASS.md",
  "sources": [
    { "url": "https://www.bjargsinhistorie.no/…", "hentet": "2026-08-24", "beskrivelse": "klubbens historieside" }
  ],
  "players": [
    { "name": "Ola Nordmann", "positions": ["CB"], "era": "historical" },
    { "name": "Kari Nordmann", "era": "modern" },
    { "name": "Per Hansen", "crossLink": true, "existingId": "per_hansen", "era": "modern" }
  ]
}
```

| Felt | Betyr |
|---|---|
| `placeId` | permanent. Banen en groundhopper må ha besøkt for å åpne klubbens spillere. Byttes aldri av en senere import. |
| `eraSource` | `belagt` når kilden daterer profilene selv (Pors), `utledet` når epoken leses av hvilken liste navnet står i (Brattvåg). |
| `sources` | minst én faktisk lest side, med hentedato. Et søketreff er ikke en kilde. |
| `positions` | presis posisjon, bare der kilden gir den. Uten posisjon blir profilen en historikkpost: den står i klubbpoolen, men banen åpner den ikke. |
| `positionGroup` | `forsvar`, `midtbane` eller `angrep` — når kilden bare oppgir lagdel. Se «Lagdel som posisjon» under. Aldri sammen med `positions`. |
| `crossLink` + `existingId` | navnet finnes i katalogen fra før og er samme mann. Profilen får klubbtilknytningen, men beholder sin egen arv — `sourcePlaceIds` røres ikke, så den frosne P1-nevneren står urørt. |

Kjøring:

```bash
node scripts/import-club-heritage.mjs data/heritage-sources/bjarg.source.json          # tørrkjøring
node scripts/import-club-heritage.mjs data/heritage-sources/bjarg.source.json --write
```

Tørrkjøring skriver ingenting og rapporterer tallene og den ferdige raden til
`ARVER` i `scripts/audit-club-heritage.mjs`. Etter `--write`: lim inn raden og
kjør `npm run audit:club-heritage`.

---

## Hvor troppen hentes fra

Fjorten av de seksten P2-arvene ble landet på **NFFs lagside**, og ingen av dem
på klubbenes redaksjonelle historikk. `scripts/nff-squad.mjs` henter og leser
den:

```bash
node scripts/nff-squad.mjs --turnering 206007   # lagene i 2. divisjon avd. 1
node scripts/nff-squad.mjs --lag 24             # troppen for ett lag
node scripts/nff-squad.mjs --lag 24 --json      # samme, som JSON
```

Sidene er server-rendret, så `curl` holder — ingen nettleser trengs. (I dette
utviklingsmiljøet må Node fetch få `NODE_USE_ENV_PROXY=1` for å lese
`HTTPS_PROXY`; se `/root/.ccr/README.md`.)

**Laget må finnes via ligatabellen, ikke via klubben.** Klubbenes lagoversikt
blander A-lag, rekruttlag, andrelag og 7er-lag — Bjarg har 84 registrerte lag,
Sotra 79. To av åtte klubber i avdeling 1 fikk først feil tropp da laget ble
plukket fra klubbsiden: Sandviken traff B-laget (10 spillere mot 32) og Eik
traff breddeklubbens «Menn 1» i stedet for «871 Menn Senior A».

Overskriftene på siden — Keeper, Forsvar, Midtbane, Angrep — oversettes av
`tilKildefelt()` til nøyaktig de feltene kildefila forstår. Draktnummer leses,
men importeres ikke: at nummer 1 pleier å være keeper er en konvensjon, ikke en
kilde, og lagdelen sier allerede det nummeret ville antydet.

`npm run audit:nff-squad` måler parseren mot en lagret lagside
(`tests/fixtures/nff-lagside-tropp.html`). Den kan ikke fange en framtidig
markupendring hos NFF — ingenting offline kan det — men den låser kontrakten og
fanger de to feilene som faktisk oppsto: at lagdel-tilskrivningen lekker forbi
troppen, og at navn og draktnummer hentes fra hver sin spiller.

---

## Lagdel som posisjon

En troppsliste sier ofte «forsvar» og ikke «midtstopper». Det er mindre enn en
posisjon og mer enn ingenting, og det er nøyaktig den oppløsningen motorens egen
troppsmodell er bygget på (`SQUAD_GROUPS`: 2 GK, 5 forsvar, 5 midtbane,
3 angrep).

Lagdelen skrives til **`usablePositions`**, ikke til `naturalPositions`, og det
er ikke en detalj. `calculatePositionFit` gir **96** for en naturlig posisjon og
**78** for en brukbar. «Forsvar» ført som fire naturlige posisjoner ville
påstått at mannen passer *godt* som både midtstopper og begge backer — en
allsidighet ingen kilde har hevdet. Ført som brukbare sier den at han kan brukes
der, som er det kilden faktisk sier.

```json
{ "name": "Ole Strømsborg", "positionGroup": "forsvar", "era": "modern" }
```

gir

```json
"naturalPositions": [],
"usablePositions": ["CB", "LB", "RB", "WB"],
"positionSource": "gruppe"
```

| Lagdel | Posisjoner |
|---|---|
| `forsvar` | CB, LB, RB, WB |
| `midtbane` | DM, CM, AM |
| `angrep` | ST, LW, RW |

**Keeper er ikke en lagdel.** «Keeper» og `GK` er samme oppløsning, så en
troppsliste som sier keeper gir en presis posisjon. `positionGroup: "keeper"`
avvises.

`positionSource: "gruppe"` gjør oppløsningen målbar, slik at et senere kildepass
kan skjerpe profilen uten å gjette. Presise posisjoner bærer ikke feltet, og
`audit:import-club-heritage` håndhever begge veier på hele katalogen: ingen
profil kan bære merket uten å ha en hel lagdel i `usablePositions`, og ingen kan
bære en hel lagdel uten merket. Grov oppløsning skal ikke kunne se presis ut.

En profil med lagdel er **spillbar** — `isSimulationReadyPlayer` leser både
naturlige og brukbare posisjoner — så lagdelen er det som avgjorde at Kvik
Halden kunne landes med 23 spillbare i stedet for 9.

---

## Supplering: en arv er ikke ferdig for godt

Registeret oppdateres hver sesong. En klubb landet på historiske navn skal kunne
få dagens tropp uten at noen redigerer katalogen for hånd, og en klubb landet på
registeret skal kunne få historien sin senere. `--suppler` er den veien inn:

```bash
node scripts/import-club-heritage.mjs data/heritage-sources/pors-2026.source.json --suppler --write
```

Modusen speilvender tre regler, og speilvendingen er hele poenget — en
supplering skal **aldri** kunne opprette en arv, og en ny import skal aldri
kunne skrive inn i en:

| | Ny import | `--suppler` |
|---|---|---|
| Klubben står `ready` | stopper | **kreves** |
| Stedet finnes i unlock-katalogen | stopper | **kreves** — og patches, ikke opprettes |
| Navnet står alt i denne arven | stopper på kollisjon | **hoppes over** som gjensyn og telles |

Den siste er den viktige. Samme tropp ett år senere er ikke tjue kollisjoner,
det er tjue av de samme mennene, og en modus som stoppet på dem ville aldri
kunne kjøres to ganger. Men den slapper bare av på **denne** klubbens navn: et
navn som står i katalogen under en annen klubb stopper fortsatt, og må avgjøres
som krysskobling eller navnebror.

**Mellomnavn er ikke et nytt menneske.** Registeret skriver `Iver Krogh Hagen`
der klubbhistorikken skrev `Iver Hagen`, og et gjensyn som bare sammenlignet
eksakte navn laget en dublett av begge — to ganger, i samme import. Skriptet
stopper nå på navnepar som skiller seg med nøyaktig ett ledd i midten, med begge
navnene i meldingen, og lar mennesket avgjøre.

Sjekken gjelder **hele katalogen**, ikke bare arven. Første utgave så bare i
arven, fordi feilen ble funnet der. Wikipedia-passet viste hvorfor det var for
smalt: «Joachim Olufsen» skulle inn i Stjørdals-Blink mens
`joachim_erlend_olufsen` sto under Rana — ingen felles arv, ingen
eksaktnavn-treff, og importen ville laget mannen på nytt. Utvidelsen fanget
**13 flere** duplikater i samme pass.

**En krysskobling til en mann som alt står i arven er også et gjensyn.** Første
utgave hoppet bare over *nye profiler* med et navn arven kjente. En
krysskobling gikk rett gjennom og ga profilen `clubAffiliations` med samme
klubb to steder — som `sync-club-affiliations` og `sim:club-squad` begge feller
ved neste kjøring, altså et sted som ikke peker tilbake på importen. Åtte
profiler traff dette i Wikipedia-passet. Nå telles den som gjensyn, og en
kildefil kan kjøres om igjen uten å endre katalogen.

Tallene i rapporten er arvens **totaler**, ikke kjøringens: `tilfort` er det
denne kjøringen la til, `dokumentert` og `spillbar` er hva klubben har etterpå.
Det er de siste to som skal inn i `ARVER`.

En arv bygget av flere importer kan bære flere `eraSource` — Brattvåg har
`utledet` fra en udatert klubbhistorikk og `belagt` fra NFFs daterte 2026-tropp.
`audit:club-heritage` godtar derfor en liste, og `audit:import-club-heritage`
rekonstruerer arven i samme rekkefølge som den faktisk ble bygget.

---

## Fire ting en review-bot fant, og som alle var ekte

`chatgpt-codex-connector` leste PR-en og flagget fire ting. Alle fire var reelle
feil i koden her, og alle er rettet.

**Nasjonalitet ble oppfunnet.** Feltet sto som `kilde.nationality || "Norge"`,
og siden ingen kildefil oppga det, ble hver eneste importerte spiller norsk. En
troppsliste dokumenterer at mannen er *registrert i norsk seriesystem*, ikke
hvilket land han spiller for — og `getNationalBasePlayerIds` i `app.js` velger
landslagsspillere på nøyaktig likhet, så feilen gjorde **Gambias Jibril Bojang
og Robin Bjørnholm-Jatta, Tunisias Sebastian Tounekti og Trinidad og Tobagos
Nicklas Frenderup valgbare for Norge** — og utilgjengelige for sine egne land.
Feltet settes nå bare når kilden sier det, per spiller eller for hele fila, og
utelates ellers. De fire er rettet i katalogen.

**Slugen tapte bokstaver Unicode ikke dekomponerer.** NFD splitter «é» i e +
aksent, men «ł» er én egen bokstav uten aksent å skille ut, og falt gjennom til
understrek: `Paweł Chrupałła` ble `pawe_chrupa_a`. Siden samme slug er
navnekollisjonsnøkkelen, ville en senere kilde med ASCII-stavemåten ikke funnet
ham og laget en dublett med halv karriere. `ł đ ħ ŋ œ þ ð ß ı ĸ` translittereres
nå eksplisitt, og id-en er rettet.

**En halv arv kunne ikke fullføres.** `--suppler` krevde `ready`. En import med
under femten spillbare er et gyldig utfall — stedet opprettes og klubben står
`pending` — men da avviste vanlig modus den fordi stedet fantes, og `--suppler`
fordi poolen ikke var ferdig. Den halve arven kunne bare fullføres ved å
redigere katalogen for hånd, som er nøyaktig det verktøyet finnes for å slippe.
Kravet er nå at arven FINNES (`homePlaceId`), ikke at den er ferdig.

**Et gjensyn kastet posisjonen kilden ga.** Se under.

---

## Skjerping: et gjensyn kan bære en posisjon profilen ikke har

`--suppler` hoppet over enhver mann som alt sto i arven. En historikkpost uten
posisjon som senere dukket opp i en datert tropp med lagdel forble derfor
ikke-spillbar, utenfor banens unlocks og utenfor den spillbare poolen — og
rapporten kalte det et harmløst gjensyn.

Regelen er **ensrettet**, og de tre utfallene er ulike påstander:

| Kilden sier | Utfall |
|---|---|
| ingenting nytt om posisjonen | gjensyn — han hoppes over og telles |
| en posisjon, og profilen har ingen | **skjerping** — han blir spillbar |
| en posisjon som avviker fra den han har | **stopp** |

En posisjon skrives aldri over, og oppløsningen kan aldri bli grovere. Sier to
kilder ulikt om samme mann, er det ikke en avgjørelse et skript kan ta:
importen stopper og lar mennesket lese begge.

En skjerpet profil legges også inn i **banens unlocks**. Uten det ville arven
stått med flere spillbare enn banen åpner, og `audit:club-heritage` felt den.

**Modusen har null arbeid å gjøre i dag.** Målt mot alle 326 hentede
Wikipedia-artikler finnes det sju profiler en kilde kunne skjerpet, og alle sju
er de tvetydige tolagdels-verdiene («Forsvar/Midtbane», «Back, midtbanespiller»)
som skjemaet ikke kan uttrykke og importen med vilje avviser. Regelen finnes
fordi den stille tapte en påstand, ikke fordi den har en kø å ta.

---

## Hva importen stopper på

Ingen av disse er en verdi skriptet kan velge. Hver av dem er en avgjørelse
kilden må ta, og importen skriver ingenting før alle er ryddet.

- ukjent posisjon — en kilde som sier «spiss» oversettes av den som leser den,
  ikke av en synonymtabell i skriptet;
- ukjent lagdel, og `positions` og `positionGroup` satt samtidig — kilden sier
  enten posisjon eller lagdel, ikke begge;
- `GK` sammen med en utespillerposisjon — koherensregelen fra P3. Uten den gir
  `usablePositions` positionFit 78, og motoren ville stilt en navngitt keeper på
  midtbanen uten å flagge misbruk;
- `strengths`, `archetypeIds`, `preferredRoles`, `likesTactics` og de andre
  utledbare feltene satt i kildefila — de hører til P1-overlayet med `claim` og
  `source`, ikke i råfila;
- et navn som finnes i katalogen fra før, uten at kildefila sier om det er samme
  mann (`crossLink` + `existingId`) eller en navnebror;
- manglende `era`, manglende kilde, kilde uten hentedato, samme navn to ganger;
- en klubb som alt står `ready`, eller et `homePlaceId` som allerede peker et
  annet sted — begge deler er permanente og byttes ikke av en import.

## Hva vakten måler

`npm run audit:import-club-heritage` fjerner Pors og Brattvåg fra katalogen i
minnet, bygger kildefilene på nytt fra de samme profilene, og krever at
importen gjenskaper begge arvene — profilene felt for felt, banens unlocks,
klubbraden og hver krysskobling. Fasiten hentes fra katalogen slik den er, så
endrer profilformen seg, endrer fasiten seg med. Begge arvene er med fordi de er
ulike på det ene punktet som betyr noe for formen: Pors daterer seg selv,
Brattvåg har ikke ett eneste årstall. Deretter kreves det at hvert av de tjue
avslagene faktisk slår til, og at ingen profil i katalogen kan bære en grov
posisjonsoppløsning uten å si det.

---

## To ting reproduksjonen fant

**Rekkefølgen i `clubAffiliations` eies av `sync-club-affiliations.mjs`,** som
sorterer alfabetisk på `clubId` og kjører i CI som en drift-sjekk. En
krysskobling lagt bakerst i lista ville derfor ikke felt importens egen vakt,
men `sync-club-affiliations` ved neste kjøring — altså et sted som ikke peker
tilbake på importen. Skriptet sorterer nå etter innsetting.

**Ti av Pors' elleve profiler med kildebelagt posisjon bærer historikkpostens
advarsel,** som sier at posisjonen *ikke* er kildebelagt:

> Posisjon og individuelle styrker er ikke kildebelagt i Pors-historikken.

Feltet motsier `naturalPositions`. Banen åpner de ti, og `audit:club-heritage`
fryser Pors på `spillbar: 16` — begge behandler posisjonen som kildebelagt. Var
den ikke det, skulle de ti ikke vært spillbare i det hele tatt, og tallet vært
6. Brattvåg har null slike: der følger ordlyden posisjonen konsekvent.

De ti er `john_erling_kleppe`, `svein_roger_dahlen`, `marius_solberg`,
`bard_andre_nilssen`, `sandro_occhipinti`, `torkild_lorentzen`,
`kjell_gunnar_ildhusoy`, `ole_halvor_kolstad`, `trond_viggo_toresen` og
`jan_erik_suarez`.

Det er ikke rettet her. Advarselen er tekst manageren får se, og hvilken av de
to halvdelene som er feil kan bare avgjøres mot Pors-kilden — er posisjonen
belagt, er ordlyden gal; er den ikke det, er de ti feilaktig spillbare og
`ARVER`-raden skal ned. Tallet er i stedet **festet i vakten som `ordlydsavvik:
10`**: går det opp, har en ny import kopiert feilen; går det ned, er de ryddet.
