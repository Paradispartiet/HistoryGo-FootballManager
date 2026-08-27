# P3 · styrkepasset — Store norske leksikon lest i sin helhet

**55 profiler fikk kildebelagte styrker. 592 → 667 av 3448.**

Etter at alle 60 klubbene hadde arv, var den tynne flaten ikke lenger navn.
Katalogen hadde 3284 spillbare profiler og **2692 av dem uten én eneste
styrke** — posisjon uten karakter, slik at motoren skilte spillere på epoke og
posisjon alene. Sju klubber sto på null av tretti.

---

## Kilden fantes fra før, og var ikke lest ut

P1-registeret bruker **Store norske leksikon** som kilde. Det som ikke var gjort
er å lese SNL *systematisk*: leksikonet har en taksonomi som heter **«Norske
fotballspillere»**, og den inneholder **305 biografier**.

```
https://snl.no/.taxonomy/13112      → 305 artikler
```

171 av navnene står i katalogen fra før. 6 av dem hadde alt styrker via P1.
**109 ble lest enkeltvis.**

SNL skriver ofte én setning som beskriver spillemåten, og det er nøyaktig den
sjangeren P1 leter etter:

> «Gunnar Halle var en hardtarbeidende og taklingssterk back med gode defensive
> og offensive kvaliteter.»

> «Erik Mykland er kanskje Norges beste tekniske spiller gjennom tidene, med
> fantastiske driblinger, lynraske eller lure vendinger og uventede
> gjennombruddspasninger.»

**55 av de 109 bærer en slik påstand. 54 gjør det ikke**, og de står ikke i noe
register. En biografi som bare forteller karriere gir ingen styrker — det er
P1-regelen, og den gjelder her uendret: aldri slutte fra kamper, mål, trofeer,
kapteinsbind eller klubbstatus.

## Fire ting kilden sa nei til

Utelatelsene er like mye et resultat som postene:

- **Thomas Myhre** har bare *svakheter* beskrevet — «tabbet seg ut da han slapp
  inn to enkle skudd». En negativ beskrivelse er ikke en styrke, og speilvendt
  er den ingenting.
- **Erland Johnsen** har eksplisitte svakheter: «De sterke sidene kompenserte
  for svakheter når det gjaldt teknikk og pasningsspill.» Han fikk seks styrker
  og **ikke** `first_touch` eller `simple_passing`, og setningen står i posten
  hans så neste leser ikke legger dem til.
- **Vidar Riseth** var «en brukbar hodespiller». Brukbar er ikke en styrke.
  `heading` er ikke ført.
- **Per Skou, Kristian Henriksen, Freddy dos Santos, Eldar Hansen** er beskrevet
  bare som kapteiner eller ledere *etter* karrieren. Kapteinsbind er en rolle,
  ikke en ferdighet, og P1 forbyr uttrykkelig å slutte fra det.

## `claim` siterer nå kilden

P1-postene skriver engelske sammendrag av norske kilder:

> `"Store norske leksikon describes Kristoffersen as technically gifted…"`

De nye postene siterer originalen ordrett. Forskjellen er praktisk: **en påstand
som gjengir kildens egne ord kan kontrolleres uten å åpne kilden på nytt**, og
en vakt kan kreve det — `audit:p2-source-claims` feller en `claim` uten
anførselstegn.

---

## Hvor postene havnet

Registeret måtte deles, fordi P1 har en frossen nevner:

| | Antall | Hvor |
|---|---:|---|
| Utenfor de 18 P1-arvene | **38** | `src/football-player-source-claims-p2.js` (ny) |
| I en NY P1-arv | **11** | `P1_NEW_DOCUMENTED` |
| I en EKSISTERENDE P1-arv | **6** | `P1_EXISTING_SUPPLEMENTS` |

**Det frosne er nevneren, ikke dekningen.** 936/701/235 er populasjonen P1
målte og kan ikke flyttes uten en dokumentert identitetsavgjørelse. Fordelingen
over den er en *måling* av hvor mye av populasjonen en kilde beskriver, og den
skal flytte seg når noen leser en kilde som ikke var lest. Den flyttet seg:

```
45 DOKUMENTERT · 15 DELVIS · 876 THIN-SOURCE
62 DOKUMENTERT · 15 DELVIS · 859 THIN-SOURCE
```

`expectedDocumented` for Brann (5 → 8), Viking (4 → 6) og Lillestrøm (2 → 3) er
flyttet tilsvarende, og `expectedThin` ned med det samme.

**P2-registeret er det stedet som manglet.** Importverktøyet nekter å ta imot
`strengths` i en råfil — de hører til et overlay med `claim` og `source` — men
P1-overlayet gjelder bare sine egne 18 arver. Alt utenfor hadde ingen steder å
gjøre av seg. Nå har det det, i samme form.

`applySourceClaims` kjører **P1 først, så P2**. De to overlapper ikke, og
vakten håndhever det: en post i P2 for en spiller inne i en P1-arv felles. I
tillegg lar P2 en profil som alt har styrker stå, slik at rekkefølgen ikke kan
snu et resultat uansett hvordan registrene vokser.

---

## Ratchet-vakten regnet ut sin egen konsekvens

`sim:player-attributes` har en tabell, `KJENT_UDOKUMENTERT`, med et tak per bane
på hvor stor andel som kan mangle dokumenterte styrker. Passet felte den — ikke
fordi noe var galt, men fordi **tolv tak nå lå igjen over det målte**:

```
lerkendal_stadion: tak 0.81, målt 0.7711, skal være 0.79
brann_stadion:     tak 0.91, målt 0.8298, skal være 0.84
aker_stadion:      tak 0.77, målt 0.7037, skal være 0.72
…
```

Et tak som ligger igjen over det målte er en tillatelse til å drive tilbake.
Vakten regnet ut de nye verdiene selv, og de er skrevet inn. Tallene i tabellen
er målte, ikke valgte.

---

## Hva som står igjen

| Klubb | Spillbare med styrker |
|---|---|
| Brattvåg, Vidar, Sandviken, Bjarg, Junkeren | **0** av 26–31 |
| Pors, Kvik Halden, Follo, Rana | 1 |
| Sandnes Ulf, Hødd, Kjelsås | 44/60, 46/69, 26/46 |

**SNL dekker ikke 2. divisjon.** De fem klubbene på null er registerklubber der
ingen spiller har en leksikonartikkel, og det er ikke en feil som kan rettes med
et verktøy — det er kildesjangeren. En spiller uten beskrivende kilde skal ha
tom `strengths`, og motoren skal utlede profilen av posisjon, epoke og
klassehøyde. Det er den ærlige tilstanden.

Neste kilde med samme sjanger ville vært **klubbenes egne jubileumsbøker og
avisportretter**, som beskriver spillere for klubber SNL ikke dekker. Ingen av
dem er digitalisert på en måte som lar seg lese systematisk herfra.
