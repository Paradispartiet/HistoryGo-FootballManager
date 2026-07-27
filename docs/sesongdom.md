# Sesongdom

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Ligasesongen **kunne** avsluttes. Etter fjorten runder ble status `completed`, en
statuslinje sa hvem som ble seriemester, og en «Start ny sesong»-knapp dukket
opp.

Men styret hadde aldri en mening. Forventningen deres var en setning satt da
klubben ble opprettet — *«Styret vil se en tydelig klubbidentitet og et kampklart
lag»* — som ingen noen gang målte deg mot. Og sesong 2 startet som om sesong 1
aldri hadde skjedd: toppscorerlista bar fjorårets mål videre, troppen var like
sliten som da sesongen sluttet, og ingenting ble husket.

## Målet er en tabellplass

Styret setter et **tall**, ikke en stemning:

| Situasjon | Målet |
|---|---|
| Første sesong | Topp 4 (øvre halvdel av åtte) |
| Du ble nr. 5 i fjor | Topp 4 — ett steg opp |
| Du ble nr. 2 i fjor | Seriegull |
| Du vant i fjor | Seriegull |
| Du ble sist i fjor | Topp 7 |

Forventningen vokser aldri mer enn ett steg per sesong. Styret er krevende, ikke
urimelig.

## Dommen

| Plassering | Dom | Styretillit |
|---|---|---|
| Seriemester | Seriemester | +14 |
| Bedre enn målet | Over forventning | +8 |
| Nøyaktig målet | Innfridd | +2 |
| Litt under | Under forventning | −10 |
| Langt under (mer enn ⅓ av feltet) | Langt under forventning | −20 |

## Ingen blir sparket av ett uhell

Én katastrofesesong gir en **advarsel**: *«Styret gir deg én sesong til. Neste
gang holder det ikke.»* To på rad koster jobben — og sparken viser tilbake til
advarselen du fikk.

En middels sesong etter en advarsel gir ikke sparken. En god sesong redder deg.
Rekkefølgen er poenget: manageren skal ha fått beskjed **før** det skjer.

## Dommen peker på manageren

Kjerneprinsippet gjelder også når det går galt. Ingen grunn får si at spillerne
ikke var gode nok — den sier hva som ble valgt:

> *Laget skapte for lite: oppsettet ga ikke nok trussel i de avgjørende kampene.*
> *Dere slapp inn for mye: balansen bakover holdt ikke i den formen laget ble satt opp.*
> *Du roterte lite — 11 spillere bar hele sesongen. Det koster mot slutten.*

Og når det går bra, krediteres valget, ikke spilleren:

> *Erling Knudtzon scoret 14 mål — plassen og rollen du ga ham fungerte.*

`sim:season-review` sjekker eksplisitt at ingen formulering skylder på spillerne.

## Sesongen huskes

Merittlista står på Statistikk og overlever sesongskiftet:

```
SESONG  PLASS   P   MÅL     DOM                      TOPPSCORER
1       8.      3   1–26    Langt under forventning  –
```

Arkivet er idempotent på sesongnummer, så en reload aldri dobbeltfører en sesong.

## Sesongskiftet rydder faktisk

«Start ny sesong» gjør nå tre ting den ikke gjorde før:

1. **Arkiverer** sesongen som avsluttes (også hvis du hoppet rett videre).
2. **Nullstiller spillerstatistikken.** Uten dette bar toppscorerlista på
   fjorårets mål i det uendelige, og «kamper spilt» ble et karrieretall forkledd
   som en sesong.
3. **Gir troppen sommerferie** (`applySummerBreak`): belastningen nulles, skader
   gror ferdig, kamprekka brytes, og formen faller mot normalen — men nulles
   ikke helt. En spiller i storform kommer tilbake med noe.

Fra en faktisk gjennomkjøring:

```
FØR:    sesong 1, runde 14, completed, 11 statistikkrader, load 35.2, form 0.45
ETTER:  sesong 2, runde 1,  active,     0 statistikkrader, load 0,    form 0.16
```

Og målet flyttet seg med: *«Dere endte på 8. plass i fjor. Styret vil se ett steg
opp: topp 7.»*

## En liten løgn som ble rettet

Rett etter sommerferien sa tilstandsflata *«Ingen slitne, ingen skadde — du har
rotert godt.»* Alle var uthvilte fordi **kalenderen** sa det, ikke fordi
manageren roterte. Nå sier den *«Troppen er uthvilt etter oppholdet.»*

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:season-review` | 62 sjekker: målet er en tabellplass som vokser ett steg, dommen følger plasseringen, styretilliten flytter seg, advarselen kommer før sparken, dommen peker på manageren, merittlista er idempotent, sommerferien nullstiller riktig |
| `npm run audit:dead-ends` (steg 22) | motoren er ren, dommen felles ved sesongslutt og vises på Statistikk fra render-løypa, merittlista er modus-isolert, og sesongskiftet nullstiller statistikk og gir sommerferie |
