# Ligaen er fotball, ikke aritmetikk

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Det samme gjelder motstanderen: spørsmålet er om du forstår **hva de gjør**.

## Feilen: fjorten runder mot samme lag

Spillet har tolv historiske taktiske arketyper — Sacchis Milan, Ajax' totalfotball,
Leicesters overganger. De er det beste i spillet. Men de fantes bare i scenarioer
og mesterskap. I ligaen sto det «Molde, styrke 78».

Verre: oppslaget som skulle hente motstanderprofilen lette etter **klubb-id-en**
(`molde`, `brann` …) blant de fem *generiske* profilene, som heter
`high_press_opponent`, `low_block_opponent` og lignende:

```js
const base = OPPONENT_PROFILES.find((p) => p.id === opponent.id) || OPPONENT_PROFILES[0];
```

En klubb-id kan aldri finnes der. Fallbacken slo derfor inn **hver eneste gang**:
alle fjorten serierunder ble spilt mot `high_press_opponent`, med bare navn og
styrke byttet ut. Ingen feilmelding, ingen rød vakt — bare en sesong der
motstanderen aldri endret seg.

Dette er den samme klassen som skalafeilene i CLAUDE.md: koden så riktig ut på
begge sider av grensesnittet, og bare en **måling** kunne avsløre det.

## Nå: hver klubb spiller en skole

Klubben eier identiteten (navn, bane, styrke). Arketypen eier fotballen.

| Klubb | Taktisk identitet | Historisk skole |
|---|---|---|
| Vålerenga | høyt press | Liverpool 2018–20 — gegenpress |
| Brann | bredt angrepsspill | Arsenal 2003–04 — the Invincibles |
| Rosenborg | 4-3-3 og gjenvinning | Ajax 1971–73 — totalfotball |
| Viking | direkte overganger | Leicester 2015–16 — direkte overgang |
| Lillestrøm | duellkraft | Contes Chelsea 2016–17 — 3-4-3 |
| Tromsø | kompakt struktur | Inter på 60-tallet — catenaccio |
| Molde | posisjonsspill | Barcelona 2008–12 — posisjonsspill |

`tacticalIdentity` sto her fra før, men bare som en tekststreng ingen leste.
`archetypeId` peker nå på en ekte profil i
`src/football-historical-opponent-profiles.js`.

Målt over en hel sesong: **7 ulike taktiske skoler**, hver møtt hjemme og borte,
med 12 ulike spillestil-tokens til sammen. Kampdags-UI-et leste allerede
`archetypeName`, `tacticalSchool` og `keyBattles` for scenario- og
mesterskapsmotstandere — de feltene kommer nå på ligamotstanderne også, så
kampbriefen tente av seg selv.

## Vakten

`sim:league-season` går gjennom en **hel sesong** og krever:

- hver klubb har en `archetypeId` som peker på en profil som finnes
- ingen to klubber deler skole (ellers mister sesongen variasjon)
- sesongen byr på nøyaktig 7 ulike skoler, hver møtt to ganger
- minst 8 ulike spillestil-tokens i løpet av sesongen
- app.js slår opp **arketypen**, ikke klubb-id-en

Den siste sjekken er den som ville fanget feilen: den avviser eksplisitt det
gamle uttrykket som aldri kunne treffe.

## Én ting til, ikke fikset

Terminlista gir seks hjemmekamper på rad, så seks bortekamper. Ekte dobbel
serie alternerer. Det er en egen sak, ikke rørt her.
