# Landslagsmodus

> Alle spillere er gode nok. Spørsmålet er om treneren forstår dem.

Landslagsmodus er den fjerde spillmodusen ved siden av ligaspill, scenarioer og
Fotballvitenskap. Den svarer på et konkret problem i samlemodellen: en
landslagsarena som Ullevaal skal **ikke** kunne gi klubblaget ditt hele Norges
beste på ett besøk – men de spillerne må ha et sted å bli spilt. Det stedet er
landslagsmodus.

## Hvor spillerne kommer fra

Troppen er unionen av to kilder, filtrert på nasjonen du har valgt:

| Kilde | Hvem | Krever History Go? |
|---|---|---|
| **Grunnstammen** | Nasjonens jevne klubbspillere (`overall` under `NAME_TIER_MIN` = 90), hentet fra klubbanleggene i `data/football_unlocks.json` | Nei |
| **Samlingen din** | Alt du faktisk har låst opp – inkludert landslagsstjernene fra arenaer med `placeRole` som inneholder `national` | Ja |

Grunnstammen finnes fordi modusen ellers ville vært en blindvei: en ny manager
uten History Go-progresjon møtte «Du har ikke samlet spillere ennå» og hadde
ingen vei videre. Nå er grunnstammen alltid der, og samlingen er det som løfter
laget. Nasjonskortet viser begge tallene (`21 spillere å velge blant · 0 samlet
i History Go`), så det synes hva samlingen tilfører.

En nasjon er spillbar når den samlede poolen er minst `REQUIRED_SQUAD_SIZE` (15).
Nasjoner under grensa vises låst med teller, slik at det er tydelig hva som
mangler i stedet for at de forsvinner.

## Isolasjon fra klubblaget

Landslagsmodus er en egen sesjon i modus-konvolutten
(`src/football-mode-sessions.js`), på linje med scenario og Fotballvitenskap:

- `MODES` inneholder `"national"`, og `nationalTeam: { nationality, squadPlayerIds }`
  er et `SESSION_STATE_FIELDS`-felt.
- En ny landslagssesjon starter uten nasjon og uten tropp, uten terminliste og
  uten mini-sesong (`createSecondarySession`).
- Landslagstroppen skrives **aldri** inn i klubblagringen. Bytter du til
  ligaspill, er klubbsnapshotet byte-identisk, og landslagsspillerne er igjen
  bare speidet.
- Valgt nasjon huskes når du kommer tilbake, og overlever refresh.

`sim:mode-isolation` vokter alt dette.

## Flyten

1. **Onboarding** → modus-kortet «Landslagssjef».
2. **Velg nasjon** – første handling i «Neste handling»
   (`national-choose-nation`) så lenge ingen nasjon er valgt.
3. **Sett laget** – troppen fylles automatisk; feilbruk er lov og blir forklart.
4. **Trening og kamp** – samme løkke som ellers, mot de historiske
   stil-motstanderne.

Nytt nasjonsvalg nullstiller troppen, siden spillerpoolen endres.

## Startelleveren kan alltid fylles

Krever formasjonen flere av en posisjon enn troppen har – 1-1-8 med åtte spisser
er det verste tilfellet – hadde auto-fyll tidligere gitt opp og latt plassene stå
tomme. Manageren fikk «Fyll 2 plasser» og ingen spiller å fylle dem med.

`findBestAvailablePlayerForSlot()` har derfor et siste nivå som tar hvilken som
helst ledig spiller. Det er ikke en innrømmelse – det er premisset: feilbruk er
lov, og motoren merker plassen som feilbrukt og forklarer hvorfor, i stedet for
å blokkere. Manageren kan alltid bytte selv. `audit:dead-ends` (steg 13) vokter
fallbacken.

## Datakontrakt

- Ingen spillere, nasjoner eller formasjoner hardkodes i `app.js`.
  Nasjonslista utledes av `nationality` i `data/football_players.json`, og
  klubb/landslag-skillet av `placeRole` i `data/football_unlocks.json`.
- Modusen skriver aldri til `visited_places` eller `hg_groundhopper_stats_v1`,
  og leser `hg_learning_log_v1` uten å skrive til den (se
  [HISTORY_GO_QUIZ_GATE.md](HISTORY_GO_QUIZ_GATE.md)).
- Med dagens data er Norge den spillbare nasjonen (21 i grunnstammen, 17
  landslagsstjerner å samle). Flere nasjoner blir spillbare når det legges inn
  nok spillere med den nasjonaliteten – ingen kodeendring trengs.

## Vakter

| Skript | Dekker |
|---|---|
| `npm run audit:flow` (steg 13) | modusvalg, grunnstamme, nasjonsteller, panel, nasjonsbytte, neste handling |
| `npm run audit:dead-ends` (steg 13) | auto-fyll kan alltid fylle startelleveren |
| `npm run sim:mode-isolation` | egen sesjon, ingen lekkasje til klubben, nasjon huskes, nullstilling |
