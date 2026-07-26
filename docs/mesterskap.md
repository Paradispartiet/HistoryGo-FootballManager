# Mesterskap: EM og VM

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Landslagsmodus hadde spillere, men ingenting å spille om. Mesterskapet er det som
gjør den til et spill: gruppespill, utslagsrunder og en vei som kan ta slutt.

## De to mesterskapene

| | Lag | Grupper | Managerens kamper | Vei |
|---|---|---|---|---|
| **EM** | 8 | 2 × 4 | 5 | 3 gruppekamper → semifinale → finale |
| **VM** | 16 | 4 × 4 | 6 | 3 gruppekamper → kvartfinale → semifinale → finale |

De to beste i hver gruppe går videre. Utslagskamper må ha en vinner: står det
uavgjort, avgjøres den på straffer — deterministisk fra turneringens seed, ikke
tilfeldig.

EM krever at nasjonen din er europeisk (`confederations` i dataen). VM er åpent.
En nasjon uten konføderasjonsdata får VM, aldri ingenting — mesterskapsvalget
skal ikke kunne bli en blindvei.

## Motstanderne

Motstanderne er nasjoner, men de **spiller som historiske taktiske arketyper**:
hver nasjon i `data/football_tournaments.json` peker på en profil i
`src/football-historical-opponent-profiles.js` og forteller hvilken taktisk arv
den spiller med.

```json
{
  "nationality": "Italia",
  "styleProfileId": "milan_1988_90_sacchi",
  "styleHeritage": "Sonepressen fra Milano – linjeavstand og kollektiv timing",
  "strength": 83,
  "confederations": ["europa", "verden"]
}
```

Kampdagen får dermed en ekte læringsmotstander med matchup, formasjonskunnskap
og forklaring — nøyaktig samme kontrakt som ellers. Ingen logoer, drakter eller
offisiell grafikk: dette er tekstlige, faglige læringsprofiler.

Flere nasjoner kan dele arketype når den taktiske arven faktisk er delt (Uruguay
og Hellas i catenaccio-tradisjonen, Japan i den tyske gegenpress-skolen).
`styleHeritage` sier hvorfor, per nasjon.

## Hva motoren gjør — og ikke gjør

`src/football-tournament.js` er ren ESM: ingen DOM, ingen `fetch`, ingen
`localStorage`, ingen `Math.random`, ingen `Date.now`. Lik input gir
byte-identisk output. `audit:flow` (steg 14) vokter dette.

**Motoren simulerer aldri managerens egen kamp.** Den konsumerer resultatet fra
Kampdag v0.2 — samme kontrakt som ligasesongen — og avgjør bare turneringens
gang. De andre kampene avgjøres deterministisk fra seed og styrke; de er ramme,
ikke fasit. Styrketallene setter forventningen rundt en kamp. De rører aldri din
egen: den avgjøres av oppstilling, roller, taktikk og relasjoner.

Seeden er `<mesterskap>-<nasjon>-<antall tidligere mesterskap + 1>`, så
trekningen er stabil gjennom et mesterskap, men et nytt gir en ny gruppe.

## Isolasjon

`tournament` og `tournamentHistory` er sesjonsfelt i modus-konvolutten, som
`nationalTeam`. Et pågående mesterskap lekker aldri inn i klubblagringen, og et
scenariorom eller Fotballvitenskap får ikke mesterskapsfelter i det hele tatt.
Bytter du nasjon, avsluttes et pågående mesterskap — det tilhørte den forrige
nasjonen. Merittlisten beholdes.

`sim:mode-isolation` vokter dette.

## Flyten

1. **Landslagsmodus** → velg nasjon.
2. **Sett laget** — troppen fylles automatisk; feilbruk er lov og blir forklart.
3. **Meld på** EM eller VM. «Neste handling» foreslår det når laget er satt.
4. **Spill kampene** i den vanlige kampdagsløkka: innboks → trening → kampdag.
   Gruppetabellen og bracketen oppdateres etter hver runde.
5. **Ut eller videre.** Blir du slått ut, avsluttes mesterskapet og plasseringen
   havner i merittlisten. Så kan du melde på igjen.

Du kan når som helst trekke laget («Trekk laget»). Merittlisten beholdes.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:tournament` | 22 sjekker: struktur, tabell, bracket, straffer, determinisme, idempotens |
| `npm run audit:tournaments` | dataskjema, referanser til stil-arketypene, bracket-matematikk, nok nasjoner |
| `npm run audit:flow` (steg 14) | motor ↔ app-kobling, kampdagsmotstander, panel, blindveivakter |
| `npm run sim:mode-isolation` | mesterskapet er landslagets, ikke klubbens |
