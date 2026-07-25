# Starttropp uten History Go

HG Football Manager skal kunne spilles uavhengig av History Go. Derfor finnes
**Auto-fyll tropp**: ett klikk bygger en spillbar starttropp, slik at en helt
fersk manager aldri står på 0/15 spillere.

> **Historikk / endring:** Denne funksjonen het tidligere «lokal starttropp» og
> fant de *nærmeste* spillerne ut fra geolokasjon eller et valgt offentlig
> «klubbanker» (stedsanker). Stedsankeret er nå **faset ut** – både som
> klubbidentitet og som kilde til spillere. Modellen under er den gjeldende.

## Fast regel

Auto-troppen er en startsnarvei, ikke ekte History Go-samling.

Spillere som kommer inn slik skal kunne brukes i HG Football Manager, men
stedene deres skal ikke markeres som besøkt eller samlet i History Go.

Bruk egen kilde:

```js
unlockSource: "local_start"
```

Ekte History Go-progresjon skal fortsatt komme fra:

```txt
visited_places
hg_groundhopper_stats_v1
```

Auto-troppen må derfor aldri skrive til disse nøklene.

## Datamodell

Lagres under eksisterende `teamMerits.localStart`:

```json
{
  "localStart": {
    "enabled": true,
    "source": "auto_squad",
    "latitude": null,
    "longitude": null,
    "chosenPlaceId": null,
    "chosenPlaceName": null,
    "playerIds": ["player_id_1", "player_id_2"],
    "createdAt": "2026-07-25T00:00:00.000Z"
  }
}
```

`playerIds` beregnes én gang når brukeren trykker auto-fyll, og lagres deretter
stabilt. Listen beregnes ikke på nytt ved hver render. Koordinatfeltene beholdes
i skjemaet kun for bakoverkompatibilitet med gamle lagringer, og er alltid
`null` i nye tropper.

## Utvelgelse (`getStarterSquadPlayerIds`)

Ingen geografi, ingen koordinater, ingen posisjonstilgang:

1. Les spillerkatalogen (`data/football_players.json` via `state.players`).
2. Prioriter spillere som faktisk kan låses opp via `player_candidate`-unlocks;
   deretter resten av katalogen.
3. Sorter deterministisk (unlockbare først, så på `id`).
4. Dekk posisjonsgruppene (keeper / forsvar / midtbane / angrep) slik at troppen
   kan settes opp på banen.
5. Fyll opp til 15 spillere med de gjenværende kandidatene.

## Stab

`getStarterSquadStaffCandidates()` gir et deterministisk utvalg stabskandidater
så lenge auto-troppen er aktiv, slik at «Velg stab» (3 stk.) er mulig uten
History Go-samling. Manageren må fortsatt engasjere dem selv.

## Integrasjon i appen

Endringen bor i `computeAvailability()` i `src/app.js`, som er sentral kilde for
tilgjengelige spillere, steder, stab og formasjoner. Auto-troppen skal ikke bli
en parallell unlock-motor: etter vanlige place-based unlocks legges
`teamMerits.localStart.playerIds` til i `unlockedPlayerIds` når
`localStart.enabled === true`.

Disse spillerne teller mot `REQUIRED_SQUAD_SIZE = 15`, kan velges i
startellever/benk, og vises med egen kilde.

## UI

Auto-fyll ligger i **Startvalg**-popupen på Speiding, ved siden av «Bruk
History Go-samlingen min». Det finnes ikke lenger geolokasjonsknapp,
stedsvelger eller «klubbanker»-status. Aktiv starttropp kan fjernes igjen.

## Nullstilling

`resetTeamMerits()` fjerner også starttroppen, siden den ligger under
`teamMerits`.

## Akseptansekriterier

- Brukeren kan fylle troppen med ett klikk, uten History Go og uten posisjon.
- Auto-troppen gir 15 spillere og nok stabskandidater til å velge 3.
- Spillere fra auto-troppen kan brukes på banen.
- Steder markeres ikke som samlet uten ekte History Go-progresjon.
- Eksisterende History Go-unlocks fungerer uendret.
- Ingen spillerdata eller koordinater hardkodes i `app.js`.
