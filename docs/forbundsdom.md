# Forbundets dom

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Landslagsmodus **hadde** en merittliste. Hvert fullført mesterskap ble lagt i
`tournamentHistory` med plassering og rekord. Men ingen hadde en mening om den.

Å ryke i gruppa med Brasil og å nå semifinalen med Norge sto som samme slags
linje — *«Ferdig · 1-1-1»* — uten at noen sa om det var bra.

## Forventningen er nasjonens tyngde

Dette er forskjellen fra klubben. I ligaen måles du mot **din egen forrige
plassering**; i landslaget mot **nasjonen du har tatt over**.

| Nasjonens styrke | Forbundet venter |
|---|---|
| 82+ | Finale |
| 76–81 | Semifinale |
| 70–75 | Kvartfinale |
| under 70 | Ut av gruppa |

Krever forventningen en runde mesterskapet ikke har, flyttes den til nærmeste
runde som finnes. EM har bare semifinale og finale — der *er* semifinalen
gruppeexiten, siden åtte lag i to grupper betyr at topp to går videre.

Det gjør at **samme resultat får motsatt dom**:

- Semifinale med en nasjon på 60 i styrke → **over forventning**
- Semifinale med Brasil på 85 → **under forventning**

`sim:federation-verdict` sjekker nettopp dette paret. Uten det er landslagsmodus
bare ligaen med andre navn.

## Dommen og følgen

| Resultat mot kravet | Dom | Forbundets tillit |
|---|---|---|
| Mester | Mesterskapstittel | +16 |
| Lenger enn kravet | Over forventning | +9 |
| Akkurat kravet | Innfridd | +3 |
| Én runde kort | Under forventning | −9 |
| To runder eller mer kort | Langt under forventning | −18 |

Som i klubben: **ingen mister jobben på ett mesterskap.** Første katastrofe gir
en advarsel; to på rad avslutter samarbeidet, og avskjeden viser tilbake til
advarselen. En tittel etter advarselen redder deg.

## Forklaringen peker på manageren

> *0-2-1 på 3 kamper, 1–5 i mål.*
> *Laget skapte for lite: oppsettet ga ikke nok trussel mot organiserte mesterskapslag.*
> *For mange uavgjorte: planen var trygg, men den avgjorde aldri en kamp.*

Og når du overpresterer, krediteres lesningen:

> *Norge kom lenger enn troppen tilsa — det er lesningen din som bar dem.*

Simuleringen sjekker at ingen grunn skylder på spillerne.

## Fra en faktisk gjennomspilling

```
FORBUNDETS DOM · INNFRIDD
Ute i semifinale med Norge — forbundet ventet å nå semifinalen.
Forbundet er tilfreds. Nasjonen leverte det den skulle. Forbundets tillit +3 (nå 53).
  2-1-1 på 4 kamper, 8–6 i mål.
  Forbundets krav var å nå semifinalen. Forbundet venter at nasjonen er blant de fire beste.

MERITTLISTE
EM · Norge          Ute i semifinale · 2-1-1 · Innfridd
```

Merittlista bærer nå dommen, ikke bare rekorden.

## Noe som dukket opp underveis

Mellom gruppespill og semifinale ble laget plutselig ikke kampklart:
*«Fyll 11 plasser i startelleveren.»* Skader fra `docs/form-og-slitasje.md` hadde
tatt spillere ut av elleveren, og troppen måtte settes opp på nytt før
semifinalen.

Det er ikke en feil — det er hele poenget med slitasjelaget. Men det er verdt å
vite at det treffer hardest i mesterskap, der troppen er liten og kampene tette.

## Isolasjon

Forbundets tillit og dom lever i landslagsmodusens egen sesjon
(`football-mode-sessions.js`). Klubbkarrieren har sin egen styretillit og sin
egen merittliste; de to blandes aldri.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:federation-verdict` | 47 sjekker: forventningen følger nasjonens styrke, samme resultat gir ulik dom, hele stigen fra gruppeexit til tittel, advarsel før avskjed, forklaringen peker på manageren, merittlista, renhet |
| `npm run audit:dead-ends` (steg 24) | motoren er ren og leser ikke `overall`, dommen felles ved fullført mesterskap og vises i landslagsflata, merittlista viser dommen, tilliten er modus-isolert |
