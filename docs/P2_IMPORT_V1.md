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
Brattvåg har ikke ett eneste årstall. Deretter kreves det at hvert av de nitten
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
