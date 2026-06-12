# Lokal starttropp

HG Football Manager skal støtte et valgfritt startvalg: **Start lokalt**.

Når spilleren velger dette, skal spillet finne de nærmeste kvalifiserte fotballspillerne ut fra nåværende lokasjon eller valgt offentlig startsted. Målet er at manageren kan begynne lokalt med en spillbar tropp på opptil 15 spillere.

## Fast regel

Lokal starttropp er en startsnarvei, ikke ekte History Go-samling.

Spillere som kommer inn via lokal start skal kunne brukes i HG Football Manager, men stedene deres skal ikke automatisk markeres som besøkt eller samlet i History Go.

Bruk egen kilde:

```js
unlockSource: "local_start"
```

Ekte History Go-progresjon skal fortsatt komme fra:

```txt
visited_places
hg_groundhopper_stats_v1
```

Lokal start må derfor ikke skrive til disse nøklene.

## Datamodell

Lagre lokal start under eksisterende `teamMerits`, for eksempel:

```json
{
  "localStart": {
    "enabled": true,
    "source": "current_location",
    "latitude": 59.924,
    "longitude": 10.734,
    "chosenPlaceId": null,
    "chosenPlaceName": null,
    "playerIds": [
      "player_id_1",
      "player_id_2"
    ],
    "createdAt": "2026-06-12T00:00:00.000Z"
  }
}
```

`playerIds` skal beregnes én gang når brukeren velger lokal start, og deretter lagres stabilt. Listen skal ikke beregnes på nytt ved hver render.

Når brukeren velger et offentlig startsted, lagres `chosenPlaceId` og `chosenPlaceName` fra `football_place_locations.json`. Det finnes ikke noe fritekstfelt for adresse, og privat adresse skal aldri lagres.

## Utvelgelse

1. Finn koordinatfestede fotballsteder med `player_candidate`-unlocks.
2. Regn avstand fra startlokasjon til hvert sted.
3. Hent spillerne fra de nærmeste stedene.
4. Dedupiser spillerne på `player.id`.
5. Hvis samme spiller finnes på flere steder, behold nærmeste kilde.
6. Sorter etter avstand.
7. Lagre de første 15 spillerne i `teamMerits.localStart.playerIds`.

Avstand skal beregnes med Haversine, ikke enkel streng-/by-matching.

## Integrasjon i appen

Endringen skal inn i `computeAvailability()` i `src/app.js`, som allerede er sentral kilde for tilgjengelige spillere, steder, stab og formasjoner.

Lokal start skal ikke bli en parallell unlock-motor.

Etter at vanlige place-based player unlocks er lest, legges `teamMerits.localStart.playerIds` til i `unlockedPlayerIds` dersom `localStart.enabled === true`.

Disse spillerne skal telle mot `REQUIRED_SQUAD_SIZE = 15`, kunne velges i startellever/benk, og vises med kilde `Lokal starttropp`.

## UI

Legg et kompakt panel i History Go-fanen ved `Din fotballsamling`. Når laget mangler 15 tilgjengelige spillere og ingen lokal starttropp er aktiv, skal panelet tilby tre innganger til det eksisterende availability-systemet:

- bruk eksisterende History Go-samling
- start lokalt med nettleserens geolokasjon
- velg et offentlig History Go-sted fra `football_place_locations.json`

Aktiv lokal start skal fortsatt kunne fjernes, og statusfeltet skal vise hvor mange spillere starttroppen ga. Nettleseren skal først be om geolokasjon etter at brukeren klikker på lokal start. Offentlig startsted velges fra en liste; det skal ikke finnes fritekst-adressefelt.

## Nullstilling

`resetTeamMerits()` skal også fjerne lokal starttropp, siden den ligger under `teamMerits`.

## Akseptansekriterier

- Brukeren kan velge lokal start.
- Nærmeste kvalifiserte spillere lagres som lokal starttropp.
- Spillere fra lokal start teller mot 15-spillerkravet.
- Spillere fra lokal start kan brukes på banen.
- Kilde vises som `Lokal starttropp`.
- Steder markeres ikke som samlet uten ekte History Go-progresjon.
- Eksisterende History Go-unlocks fungerer uendret.
- Ingen spillerdata eller koordinater hardkodes i `app.js`.
