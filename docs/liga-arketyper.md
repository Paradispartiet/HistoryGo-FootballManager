# Ligaklubbene spiller seg selv

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Det samme gjelder motstanderen: spørsmålet er om du forstår **hva de gjør**.

## Feilen: fjorten runder mot samme lag

Oppslaget som skulle hente motstanderprofilen lette etter **klubb-id-en**
(`molde`, `brann` …) blant de fem *generiske* profilene, som heter
`high_press_opponent`, `low_block_opponent` og lignende:

```js
const base = OPPONENT_PROFILES.find((p) => p.id === opponent.id) || OPPONENT_PROFILES[0];
```

En klubb-id kan aldri finnes der. Fallbacken slo derfor inn **hver eneste gang**:
alle fjorten serierunder ble spilt mot `high_press_opponent`, med bare navn og
styrke byttet ut. Ingen feilmelding, ingen rød vakt — bare en sesong der
motstanderen aldri endret seg.

Samme klasse som skalafeilene i CLAUDE.md: koden så riktig ut på begge sider av
grensesnittet, og bare en **måling** kunne avsløre det.

## Rettingen som var feil

Første forsøk ga klubbene **historiske arketyper**: Molde som Barcelona 2008–12,
Rosenborg som Ajax '71. Det fikset bugen og var likevel galt:

- **Kategorifeil.** Styrketallet sa 78 mens etiketten sa «du møter Barcelona».
  De to påstandene motsier hverandre.
- **Det brant opp arketypene.** De tolv skolene er det du spiller *scenarioer*
  for. Møter du Ajax '71 to ganger i året i serien, slutter de å være en
  begivenhet og blir tapet.
- **Det visket ut skillet mellom modusene.** Scenario = møt historien.
  Liga = bygg klubben din.

Feilen i resonnementet var å hoppe fra «arketypene er det beste vi har» til
«altså bør de brukes overalt».

## Nå: klubbenes egen tradisjon

Klubben eier **identitet og nivå** (`LEAGUE_OPPONENT_PROFILES` i
`football-league-season.js`). Profilen eier **fotballen**
(`data/football_league_club_profiles.json`), tegnet på hvordan klubben
tradisjonelt har spilt.

| Klubb | Spillestil | Hva du møter |
|---|---|---|
| Rosenborg | Godfoten | bredt 4-3-3, korte kombinasjoner, høy linje — rom bak backene |
| Molde | Romsdalsk struktur | tålmodig posisjonsspill som går fort i det du glipper |
| Lillestrøm | Kanarifuglene | raske vendinger og kantspill; tynne sentralt |
| Brann | Bergensk temperament | direkte kantspill og innlegg, trykk som stiger med tribunen |
| Vålerenga | Oslo-kampvilje | to jagende spisser, dueller og andreballer |
| Viking | Siddis-solid | 5-3-2, kompakt bakover, direkte når ballen vinnes |
| Tromsø | Nordlyskampen | lav og smal blokk; du får ballen i 70 minutter |

Profilene er **stiliserte karakteristikker av spilletradisjon** — ikke påstander
om dagens tropp eller trener. Det står i datafilas `note`.

Kampbriefen sier hvilken av delene du møter: «Klubbens spillestil» for en
ligaklubb, «Historisk stil-motstander» for en arketyp i scenario eller
mesterskap. Ellers ville det sett ut som Molde *er* en historisk skole.

Målt over en hel sesong: **7 ulike spillestiler**, hver møtt hjemme og borte,
13 ulike spillestil-tokens.

## Vakten

`sim:league-season` går gjennom en **hel sesong** og krever:

- hver klubb har en profil med styleName, minst 2 matchupStyles, 8 styleTraits,
  nøkkelduell og managerhint
- ingen profil peker på en historisk arketyp (`archetypeId` er forbudt)
- ingen profil setter `strength` — nivået eies av klubben
- ingen to klubber deler spillestil
- sesongen byr på nøyaktig 7 stiler, hver møtt to ganger
- app.js slår opp **klubbprofilen**, ikke klubb-id blant de generiske
- kampbriefen skiller klubbstil fra historisk arketyp

De tre siste er de som fanger hver sin utgave av feilen: den opprinnelige
bugen, arketyp-rettingen, og presentasjonen.

## Én ting til, ikke fikset

Terminlista gir seks hjemmekamper på rad, så seks bortekamper. Ekte dobbel
serie alternerer. Egen sak.
