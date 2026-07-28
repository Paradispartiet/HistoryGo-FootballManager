# Treningsuka

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Trening-flata hadde tre valg som så sidestilte ut, og som ingen forklarte
forholdet mellom:

| Det som sto der | Hva det faktisk var |
|---|---|
| **Trening etter Innboks** | en **overskrift**. Fire infobokser og ingenting å velge. |
| **Ukens treningsfokus** | ett taktisk tema → metrikkbonus på kampdag |
| **Treningsprogrammer** | fire økter → off-pitch-effekt, og ellers en parallell liste over *de samme temaene* |

Programmene inneholder til og med fokusene som økter — «Fredag: Restforsvar» er
treningsfokuset `rest_defence`. Men å velge programmet valgte ikke fokuset. Du
måtte velge begge, bare det ene påvirket kampen, og ingenting sa hvilken
rekkefølge de hørte hjemme i.

**Det er ikke tre valg. Det er ett valg tatt to ganger, med ulik virkning.**

## Nå: én uke, fire steg

```
1. INNBOKS       les signalene            ikke et treningsvalg — det du leser FØR
2. PROGRAM       ukas RAMME               → belastning: hvor mye kroppene henter inn
3. FOKUS         kampens TEMA             → metrikkbonus på kampdag
4. INDIVIDUELL   ENKELTSPILLEREN          → svake sider, rollefortrolighet, restitusjon, form
```

Hvert lag har nå én jobb, og de overlapper ikke. Flata viser stegene som en
nummerert plan med status, og selve valgene ligger i popup-er — ikke som fire
like store bokser under hverandre.

### Regelen som binder ramme og tema sammen

> **Fokuset bør ligge inne i programmet.**

| | Utslag | Hva flata sier |
|---|---|---|
| Fokuset er en av programmets økter | metrikkbonus **+1** | «Pressuke trener pressing gjennom uka, og du prioriterer det samme inn mot kampen.» |
| Fokuset ligger utenfor | metrikkbonus **−1** | «Uka trener én ting og kampplanen krever en annen — laget får mindre ut av begge.» |
| Ett av dem mangler | 0 | peker på steget som gjenstår |

Merk formuleringen på spriket: *«Det er et valg du har tatt, ikke noe spillerne
mangler.»* Kjerneprinsippet holder — et dårlig utfall er en managerfeil.

Et sprik koster, men **nuller aldri ut treningsuka**: bonusen har gulv på 1. Et
feilvalg skal være en dyrere vei, ikke en blindvei. `sim:training-plan` måler
invarianten over alle åtte fokus × tre stabsnivåer, ikke bare i ett tilfelle.

## Rammen er ukas arbeidsmengde

Hvert program har alltid hatt en `fatigueLoad` per økt. **Ingen leste dem.**
Bare treningsfokusets fatigue (−4 til +6) påvirket restitusjonen, så ukas
faktiske arbeidsmengde var mekanisk uten virkning — samme klasse feil som de tre
skalafeilene i CLAUDE.md.

Summen per program, målt ut av malene:

| Program | Ukebelastning | Intensitet |
|---|---|---|
| Restitusjon og skadeforebygging | 6 | 0,75 |
| Formasjonstilvenning | 12 | 1,07 |
| Avslutning / oppbygging / balansert | 14 | 1,18 |
| Defensiv struktur | 15 | 1,23 |
| Pressuke | 19 | 1,45 |

Normaliseringen er eksplisitt mot kildens spenn — `(load − 6) / (19 − 6)` — ikke
overlatt til en klamp. `sim:training-plan` steg 2 leser spennet ut av de *ekte*
programdataene og feiler hvis konstantene og dataene glir fra hverandre, eller
hvis utslagene klumper seg på taket.

Fokuset **modulerer** rammen (±0,12), det erstatter den ikke: en pressuke med
hvilefokus er fortsatt hardere enn en restitusjonsuke med pressfokus.

Målt effekt på en spiller med belastning 70:

| Uke | Belastning etter |
|---|---|
| Restitusjonsuke | 47,5 |
| Pressuke | 60,1 |

## Individuell trening

Lagsøkta treffer alle elleve likt. Individuell trening er det motsatte: én
spiller, én uke, én manager som følger ham opp.

Dette er stedet der et ratingspill kunne sneket seg inn bakveien. Det gjør det
ikke: **ingen av sporene rører `overall` eller `matchScore`.**

| Spor | Krever | Gjør |
|---|---|---|
| **Rolletrening** | en rolle | bygger rollefortrolighet (samme oppslag som kamperfaring) |
| **Svakhetstrening** | en av *hans* svake sider | åpner rollene den svake siden stengte — se `docs/svake-sider.md` |
| **Egen restitusjon** | – | henter inn belastning, oppå lagets hvile |
| **Skarphet** | – | løfter formen litt, koster bein |
| **Opptrening** | at han er skadet | korter ned skaden med én uke |

De gjør ikke spilleren *bedre*. De gjør at han **passer bedre til det du har
tenkt å bruke ham til**, eller at kroppen tåler det du har tenkt å be om. Det er
den samme setningen hele spillet hviler på.

- Rolletrening bygger saktere enn kamp (maks 7 mot kampens 9), og **enda
  saktere** hvis han ikke spiller rollen den uka — læring uten repetisjon fester
  seg dårligere.
- Skarphet er den hardeste økta i uka. På en sliten mann er det å be om en skade.
- Formutslaget er maks 0,5 per uke, og form trekkes uansett mot null. Et blaff
  lager verken en helt eller en fiasko.

### Kapasitet

`1 + relevant stab`, kappet på 5 — men **aldri null**. En manager uten stab kan
fortsatt følge opp én spiller; alt annet ville gjort flata til en blindvei.
Å bygge stab merkes: flere plasser, og bedre uttelling per økt (faktor 0,7 uten
relevant stab, 1,25 med to eller flere).

Et avvist spor har **alltid** en grunn: «Han er ikke skadet — opptrening er for
dem som er ute.» Et «nei» uten forklaring er en liten blindvei.

## Rekkefølgen uka gjøres opp i

```
KAMP        belastning fra minuttene · form · skaderisiko
  ↓
UKA RULLER  1. laget hviler   ← RAMMEN avgjør hvor mye
            2. enkeltspillerne følges opp  ← legger seg OPPÅ lagets hvile
  ↓
KAMPDAG     fokusets metrikkbonus ± samsvaret med rammen
```

Rekkefølgen er ikke tilfeldig: egen restitusjon anvendes **etter** lagets hvile,
ellers ville den blitt spist av den.

Tilstanden er isolert per modus (`individualTraining` i `SESSION_STATE_FIELDS`).
Rolletrening fra klubbsesongen følger ikke med inn i et scenario.

## Hvor ting bor

| | Fil |
|---|---|
| Planen (fire steg, samsvar, belastning) | `src/football-training-plan.js` |
| Individuell trening | `src/football-individual-training.js` + `data/football_individual_training.json` |
| Ukas tema | `src/football-training-week.js` |
| Ukas ramme | `src/football-training-program-compositions.js` |
| Belastning/form/skade | `src/football-player-condition.js` |
| Rollefortrolighet | `src/football-role-familiarity-engine.js` |
| Svake sider | `src/football-player-weaknesses.js` + `data/football_player_weaknesses.json` |

Sporene er **data**. Verken `app.js` eller `index.html` nevner en eneste
spor-id — det er vaktet.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run sim:training-plan` | rammens belastning målt mot ekte programdata, skalaen, samsvarsregelen, at samsvaret når kampdagen, de fire stegene, renhet |
| `npm run sim:individual-training` | katalogen, kapasiteten, sanering, at et «nei» har en grunn, effektene på tilstand og fortrolighet, **at ingenting hever `overall`**, og at alt er wiret i appen |
| `npm run audit:dead-ends` (steg 25) | uka har én rekkefølge, hvert steg peker videre, samsvaret er en ekte regel, belastningen styrer restitusjonen, individuell trening er datadrevet og kapasiteten aldri null, valgene ligger i popup-er |
| `npm run sim:player-condition` | at app.js ikke gjenutleder belastningen selv, og at planmotoren leser den fra motorene som eier tallene |
