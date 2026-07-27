# Form og slitasje

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Innbytte gjorde benken til en mulighet. Men det var fortsatt **gratis** å la
stjernen stå 90 minutter hver eneste uke: ingen ble sliten, ingen skadet, ingen
mistet form. Da er ikke rotasjon en avveining — den er bare noe du *kan* gjøre.

Nå bærer spillerne konsekvensen av bruken videre.

| | Hva det er |
|---|---|
| **Belastning** | Minuttene du har spilt dem, minus hvile og restitusjonstrening |
| **Friskhet** | Hva belastningen gjør med dem akkurat nå (100 = uthvilt) |
| **Form** | Hvordan det har gått i kampene de faktisk spilte |
| **Skade** | Når belastningen får lov til å bli stående for lenge |

## Dette sier ingenting om hvor god spilleren er

En sliten spiller er ikke en dårlig spiller — han er en spiller **manageren har
brukt for hardt**. Derfor peker hver eneste formulering på bruken:

> *Kjørt hardt: 4 fulle kamper på rad. Friskhet 38 — han trenger avlastning,
> ikke en ny 90-er.*
>
> *Skadet — ute 2 uker (3 fulle kamper på rad uten avlastning).*

Motoren leser aldri `overall`, og form er tydelig midlertidig: den trekkes alltid
mot null, så et blaff verken lager en helt eller en fiasko. En spiller som
kommer tilbake fra skade er ikke tilbake i toppform.

Slitasjen tar heller aldri en spiller helt ut av spillet: bidraget faller til
maks 0.78. **En sliten spiller er fortsatt en spiller, ikke en passasjer.**

## Balansen er selve funksjonen

Første utgave ga **fire skader etter to kamper**. Det straffer deg for å spille
spillet, ikke for å bruke en mann for hardt — og gjør troppen uspillbar. Tallene
er derfor satt slik at:

- å spille en mann hver uke med normal trening er trygt en hel sesong, men
  belastningen kryper sakte oppover
- restitusjonsuker henter inn mer enn en kamp koster
- **pressuker oppå full spilletid** er det som faktisk brenner ham ut
- skader er uvanlige selv da — under 20 % i én kamp for en helt utkjørt spiller.
  De er en risiko, ikke en avgift.

`sim:player-condition` låser dette med egne balansesjekker, ikke bare
mekanikk-sjekker: en full 14-runders sesong med samme ellever skal gi høyst én
skade, mens de samme kampene med pressuker skal brenne laget ut.

## Hvor det virker inn

- **Lagstyrken.** Snittet av startelleverens slitasje gir en liten, klampet
  penalty (maks −6). Den avgjør aldri en kamp alene — men den gjør rotasjon til
  en ekte avveining.
- **Innbytte.** En som startet kampen sliten er tom tidligere: friskhet 100 gir
  terskelen på 55 minutter, friskhet 40 senker den til rundt 28. Det knytter
  `docs/innbytte.md` til denne siden.
- **Laguttaket.** Skadde spillere holdes ute av auto-fyllen.

## Skader kan aldri tømme elleveren

`findBestAvailablePlayerForSlot` holder skadde spillere utenfor de tre første
nivåene — men **ikke det siste**. Har skadene tømt troppen, må elleveren
fortsatt kunne fylles.

Ellers ville en skade vært en blindvei i stedet for et problem å løse. Å spille
en skadet mann er da managerens valg, og flaten sier det. Dette er den samme
regelen som gjør at en 1-1-8 alltid kan fylles: motoren forklarer, den blokkerer
ikke.

## Rytmen

```
KAMP      belastning fra minuttene · form fra det som skjedde · skaderisiko
  ↓
UKA RULLER  hvile (mengden avgjøres av treningsuka du valgte)
            skader teller ned i UKER, ikke i kamper
```

Akkumuleringen er idempotent på `matchId`: reload eller dobbeltkall teller aldri
samme kamp to ganger.

Tilstanden er isolert per modus. Slitasjen fra klubbsesongen følger ikke med inn
i et scenario eller til landslaget — det er en annen tropp og en annen kalender.

## Hvor du ser det

- **Trening** har flata «Form og slitasje»: hvem er skadet, hvem bør hviles, og
  hvorfor. Den ligger ved siden av treningsvalget som avgjør hvor mye laget
  henter inn igjen.
- **Taktikk** viser tilstanden på benkekortene — der du faktisk velger laget.
  Skjult slitasje er en felle, ikke en avveining.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:player-condition` | 68 sjekker: belastning fra minutter, friskhet, hvile, rotasjon, form, skader fra belastning, hele etterkamp-steget, råd, renhet — og **balansen** over en full sesong |
| `npm run audit:dead-ends` (steg 20) | motoren er ren og leser ikke `overall`, kampen legger belastning på, uka gir hvile, slitasjen virker inn på lagstyrken, tilstanden er modus-isolert og **synlig**, og skader kan aldri gjøre startelleveren ufyllbar |

En vakt som er verdt å nevne: den sjekker at `renderSquadCondition()` kalles fra
**render-løypa**, ikke bare at funksjonen finnes. Første forsøk havnet inne i en
klikk-handler, så flata oppdaterte seg bare hvis du tilfeldigvis trykket på en
sorteringsknapp — og en vakt som bare så at kallet eksisterte, var grønn.
