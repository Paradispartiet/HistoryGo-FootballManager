# HG Football Manager – datagrunnlag (`data/hgFootball/`)

Dette er datagrunnlaget for **HG Football Manager**: et historisk fotball­manager­system som er tett koblet til History Go. Modulen er rent data/skjema – den inneholder ingen UI, kart, profil- eller runtime-kode.

> **Grunnprinsipp:** *Alle spillere er gode. Treneren avgjør om systemet får frem styrkene deres.*

Spillerne ligger typisk høyt i kvalitet (f.eks. 85–100). Det finnes ingen «dårlige» historiske spillere i systemet. Kampresultatet avgjøres først og fremst av trenerens evne til å bruke spillerne riktig.

---

## Hva modulen er

HG Football Manager lar spilleren bygge lag og stab kun av spillere, trenere og staff som er **låst opp gjennom steder, klubber, stadioner og fotballhistoriske koblinger i History Go**. Modulen leverer:

- et komplett **historisk formasjonsbibliotek** (46 systemer)
- en **epokeoversikt** inspirert av Jonathan Wilson / *Inverting the Pyramid*
- en **rolletypologi** for keeper, forsvar, midtbane, angrep og historiske roller
- **regler for spiller-/rolle-/formasjonspassform** (pluss ved riktig bruk, minus ved misbruk)
- **staff-roller** koblet til klubber
- **opplåsingsregler** som binder alt til History Go

### Filer

| Fil | Innhold | Schema |
| --- | --- | --- |
| `manifest.json` | Beskriver hele modulen og source-of-truth | `history-go.hg-football.manifest.v1` |
| `formationEras.json` | 16 historiske epoker | `history-go.hg-football.formation-eras.v1` |
| `formations.json` | 46 formasjonssystemer | `history-go.hg-football.formations.v1` |
| `roleTypes.json` | Rolletypologi | `history-go.hg-football.role-types.v1` |
| `playerRoleFitRules.json` | Passform- og misbruksregler | `history-go.hg-football.player-role-fit-rules.v1` |
| `staffRoles.json` | Staff-roller og klubbkoblinger | `history-go.hg-football.staff-roles.v1` |
| `unlockRules.json` | History Go-opplåsing | `history-go.hg-football.unlock-rules.v1` |

> Schema-navnerommet `history-go.hg-football.*` er bevisst valgt for denne modulen og lever side om side med de eksisterende `data/football_*.json`-filene (`historygo-football-manager.*`). Modulen er additiv og dupliserer ikke den eksisterende unlock-loop-pakken.

---

## Hvorfor formasjoner behandles som historiske systemer

En formasjon er **ikke bare tall**. Hver formasjon i `formations.json` er et historisk taktisk system med epoke, skole, rollekrav, spillprinsipper, styrker, svakheter og – avgjørende – **faseformasjoner**.

### `baseShape` er ikke nok

Grunnformen alene sier nesten ingenting. Et system må beskrives gjennom alle kampfasene:

- `baseShape` – grunnform
- `inPossessionShape` – form med ball
- `outOfPossessionShape` – form uten ball
- `pressShape` – form i organisert press
- `lowBlockShape` – form i lav blokk
- `restDefenceShape` – sikringen bak ballen under angrep

Det er kombinasjonen av disse som definerer systemet.

### Samme tall kan bety ulike ting i ulike epoker

Identiske tall er **ikke** samme system:

- **2-3-5 historisk pyramid** (`pyramid_235`) er ikke det samme som **moderne 2-3-5 rest-defence** (`modern_rest_235` / `inverted_fullback_235`). Det første er fem faste angripere; det andre er en ballbesittelsesform med et bevisst 2-3-restforsvar bak.
- **3-2-2-3 WM** (`wm_3223`) er ikke det samme som **moderne box midfield 3-2-2-3** (`box_midfield_3223`). Det første er mannorientert mellomkrigsfotball; det andre er posisjonelt sonespill.
- **4-3-3 totalfotball** (`total_433`), **possession-4-3-3** (`possession_433`) og **moderne press-4-3-3** (`modern_433`) er tre ulike systemer med ulike prinsipper, faseformer og rollekrav.

---

## Hvorfor gamle formasjoner ikke er dårlige

Gamle formasjoner er **spillbare systemer, ikke svakere nivåer**. En 2-3-5 er ikke «dårligere» enn en 3-2-4-1 – den er et *annet* system som krever *andre* spillertyper og prinsipper.

- En pyramide vinner hvis den fylles med ekte outside-forwards, inside-forwards og en dirigerende center-half.
- En catenaccio vinner hvis den får en ekte libero og dødelige kontringsspisser.
- Et gammelt system taper bare hvis treneren bruker feil spillertyper eller feil prinsipper.

Hvert system har derfor `preferredPlayerTypes` (typene det løfter frem) og `misusedPlayerTypes` (typene som mister verdi hvis de tvinges inn feil).

---

## Hvordan spillerrolle-passform fungerer

`playerRoleFitRules.json` uttrykker hele kjernen: **riktig bruk gir pluss, feil bruk gir minus.**

En spiller får **pluss** når:
- rollen passer spillerens naturlige styrker
- formasjonen støtter spillerens bevegelser
- kampfasen bruker spilleren riktig
- taktikken samsvarer med spillerens profil
- treneren forstår systemets prinsipper

En spiller får **minus** når (eksempler fra `misuseRules`):
- en dribler brukes som møtende spiss uten rom
- en libero brukes som vanlig flat stopper
- en klassisk ving tvinges inn som smal tier uten bredde
- en targetspiss brukes i falsk nier-rolle
- en half-back brukes som fri offensiv åtter
- en spiller trekkes ut av sine sterke relasjoner

Passform vurderes på tvers av flere `fitDimensions` (roleFit, formationFit, eraPrincipleFit, phaseFit, tacticalFamiliarity, coachUnderstanding, teammateRelationFit, physicalDemandFit, creativityFit, defensiveResponsibilityFit), ikke bare posisjon. Treneren er nøkkelen: alle spillere kan vinne ligaen hvis systemet får frem styrkene deres.

---

## Hvordan History Go-opplåsing fungerer

`unlockRules.json` binder alt til History Go:

- Spilleren kan **bare** velge fotballspillere fra steder/klubber/stadioner de har samlet. Spillere fra usamlede steder er ikke tilgjengelige.
- Formasjoner låses opp via epoke, klubb, stadion, trener, historisk spiller, sportssted eller Groundhopper-relasjon.
- Moderne balanserte systemer (`modern_4231`, `modern_433`) kan være startformasjoner eller låses opp tidlig.
- Avanserte systemer (`positional_325`, `box_midfield_3223`, `modern_3241`, `modern_rest_235`) er sene opplåsinger.
- `libero_352` krever libero-rolle eller staff med libero-kunnskap; `gegen_4222` krever pressing-/fitness-/tactical-coach-kunnskap.

### Sport, stadion og Groundhopper

- Verdensberømte stadioner kan være **både** sportssteder i History Go og Groundhopper-relevante steder.
- Sportkategorien brukes for fotballstadioner, klubbanlegg, baner, arenaer og relevante idrettssteder.
- **Parker flyttes ikke til sport** bare fordi man kan trene der – kun fotball-/stadion-/klubbspesifikke steder hører hjemme i sport.

### Runtime-merknad

Hvis en unlock senere endrer brukerens progression i runtime, må koden dispatche:

```js
window.dispatchEvent(new Event("updateProfile"));
```

Denne oppgaven implementerer **ikke** runtime-kode; den leverer kun data og regler.

---

## Hvordan staff/klubbkoblinger fungerer

`staffRoles.json` definerer staben. **Staff hører til klubber, ikke bare generiske steder**, og låses opp via klubbsteder, stadioner og sportssteder.

Samlingsregler:
- **Assistenttrener** kan samles.
- **Tre trenere/treningscoacher** kan samles (`training_coach`, `maxActive: 3`).
- **Én fysio** kan samles (`maxActive: 1`).
- **Én keepertrener** kan samles (`maxActive: 1`) – og kan være en tidligere keeper (`former_goalkeeper_goalkeeper_coach`).

Staff påvirker **taktisk læring, rolleforståelse og formasjonstilvenning** (`affects`), ikke spillernes grunnkvalitet. Staben gjør altså treneren og laget bedre til å *bruke* systemene riktig.

---

## Hvordan fremtidig UI bør lese dataene

- Les `manifest.json` først; bruk `sourceOfTruth`/`files` til å laste resten.
- Behandle JSON-filene som source-of-truth. Ikke hardkod formasjoner eller roller i UI.
- Vis formasjoner som **systemer**, ikke bare tall: vis epoke, skole, prinsipper, faseformasjoner, styrker/svakheter og hvilke spillertyper systemet løfter frem vs. misbruker.
- Bruk `unlockRules.json` til å filtrere hvilke formasjoner, spillere og staff som faktisk er tilgjengelige basert på History Go-progresjon.
- Ikke endre kart, PlaceCard, profil eller Civication-runtime for å vise disse dataene i denne fasen.

## Hvordan kampmotor senere bør bruke dataene

- Start fra at alle spillere er sterke; la `playerRoleFitRules.json` avgjøre pluss/minus ut fra rolle, formasjon, fase, relasjoner og trenerforståelse.
- Bruk `matchEngineEffects` (0–10 per dimensjon: attackingWidth, centralControl, defensiveSecurity, transitionThreat, pressingIntensity, restDefenceSecurity, roleComplexity, staminaDemand, creativityDemand, coachingDemand) som systemets profil.
- Vekt trenerens forståelse (`coachUnderstanding`) tungt: feil taktikk skal misbruke styrkene, riktig taktikk skal frigjøre dem.
- Bruk faseformasjonene til å modellere ulike kampfaser i stedet for én statisk form.
- La staff-effektene øke taktisk fortrolighet og rolleklarhet over tid, slik at krevende systemer (high / very_high `tacticalDifficulty`) blir spillbare når laget har riktig stab.

---

## Validering

Dataene valideres av et read-only audit-script (følger repoets `.mjs`-konvensjon):

```bash
npm run audit:hg-football
# eller
node scripts/audit-hg-football-data.mjs
```

Auditen leser `manifest.json`, validerer JSON i alle registrerte filer, sjekker at alle `eraId` finnes, at rolle-referanser peker på gyldige `roleTypes`, at `unlockRules` peker på gyldige formasjoner, at alle formasjoner har alle seks faseformer, at `matchEngineEffects` finnes med 0–10-verdier, og at `tacticalDifficulty` kun bruker `low/medium/high/very_high`.
