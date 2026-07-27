# Innbytte

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Spillet har alltid **krevd** fire benkespillere. `REQUIRED_BENCH = 4`, og
kampklar-porten slapp deg ikke gjennom uten dem. Så satt de der. Ingen av dem
kom noen gang inn — søk på `substitut` eller `innbytt` i motoren ga null treff.

Statistikkflata avslørte det selv: etter tre kamper sto **alle elleve med
nøyaktig tre kamper**. Ingen roterte, fordi ingen kunne.

En tvungen input uten konsekvens er samme blindvei som en fane som ikke sender
deg noe sted. Den ser ut som en managerbeslutning, spillet krever den av deg, og
den gjør ingenting.

## Byttet er en beslutning

Effektformen er den samme som managergrepene og planbyttene —
`{ eventScoreDelta, xgDeltaFor, xgDeltaAgainst, momentumDelta, riskDelta,
tacticalClarityDelta }` — så `finalizeMatchdaySession` summerer alt i ett
regnestykke. Et bytte er ikke en knapp ved siden av spillet.

Tre bytter av fire på benken. Du kan ikke bruke alle; valget skal koste noe.

## Plassen avgjør, ikke klassen

Den som kommer inn overtar **plassen** — posisjonen og rollen — til den som går
av. Han måles på hvor godt han passer *der*, ikke på hva han er verdt generelt.

Ved avspark regner motoren ut hvor godt hver benkespiller ville passet på hver
av de elleve plassene (4 × 11 = 44 utregninger, én gang). Derfor kan UI-et vise
konsekvensen **før** du bestemmer deg:

```
Hvem inn som Bred dribler?
  Eirik Hestad          passform 78 (−15) · passer plassen dårligere (78 mot 93)
  Birger Meling         passform 79 (−14) · passer plassen dårligere (79 mot 93)
  Sivert Heltne Nilsen  passform 49 (−44) · passer plassen dårligere (49 mot 93)
```

En spiller med lavere klasse kan løfte laget fordi han passer plassen bedre. Og
setter du en spiss inn på stopper, er det feilbruk: motoren **stopper deg ikke**,
men den sier det rett ut — *«det er ditt valg, ikke hans begrensning.»*

Motoren leser aldri `overall`. `audit:dead-ends` steg 19 sjekker det.

## Tre lesninger av kampen

Forbedringen er summen av tre ting manageren skal se:

| Lesning | Hva den måler |
|---|---|
| **Passform** | Passer den som kommer inn plassen bedre enn den som går av? |
| **Slitasje** | Har den som går av gått lenge? Ingen gevinst før 55. minutt, full etter 90. |
| **Kampbildet** | Offensivt bytte når du jager, defensivt når du leder — eller motsatt. |

Feilbruk trekker fra. Oppå kommer **prisen**: et bytte forstyrrer et lag som
spiller, og sent i kampen har laget mindre tid på å finne hverandre igjen. En
trener som forstår systemet sitt betaler mindre — samme mønster som
omstillingskostnaden for planbytter.

Slitasjen leses av **minuttene spilleren faktisk har spilt i denne kampen**.
Ingen ny, skjult spillertilstand mellom kamper — det er et eget steg.

## Spilletid

Innbytteren får kampen sin, og minuttene sine. Uten det ville statistikken vært
en løgn: en spiller som kom inn i det 23. minutt og la opp utligningen ville
ikke eksistert i sesongen.

```
Spiller            K   Min   M   A
Eirik Hestad       1    67   0   1     ← inn 23'
Erling Knudtzon    1    23   0   0     ← ut 23'
Mike Jensen        1    90   1   0
```

`playedPlayersFor(session)` bygger lista av alle som var på banen, med `from` og
`to`. Uten bytter står alle med 90 — ingen spesialtilfelle.

## Kampen som én fortelling

Byttet ligger i samme spor som alt annet:

```
 7'  Sjanse: reddet av keeper
16'  Sjanse imot: reddet av keeper
23'  Innbytte: Erling Knudtzon ut, Eirik Hestad inn (Bred dribler)
24'  Ditt grep: Gi frihet til den kreative spilleren
38'  Mål imot — 0–1
45'  De trekker seg ned
68'  Ditt grep: Senk presset og gjør midten kompakt
75'  Mål: Mike Jensen — 1–1
```

Målene bærer scoreren nå, siden spillerstatistikken vet hvem det var.
Motstanderens mål gjør det ikke — vi kjenner ikke troppen deres.

### En blindvei i miniatyr, funnet på veien

Sluttrapporten skrev overskriften **«Kampen minutt for minutt»** og så ingenting
under den. En ferdig kamp (`lastMatch`) har ikke klokke — den bærer `outcome`,
ikke `liveMinute` — så avdekkingsfilteret som skal skjule minutter du ennå ikke
har sett, strøk hele loggen. Regelen gjelder bare mens kampen faktisk spilles av.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:substitutions` | 56 sjekker: benken vurderes mot hver plass, plassen avgjør ikke klassen, slitasje, kampbildet, gjennomføring uten mutasjon, kvoten på tre, ugyldige bytter, spilletid |
| `npm run audit:dead-ends` (steg 19) | benken er wiret hele veien fra `app.js` til rapporten, byttet summeres i resultatet, statistikken teller alle som var på banen, motoren leser ikke `overall`, og minuttloggen vises i sluttrapporten |
