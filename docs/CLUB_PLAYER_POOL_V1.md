# Klubbpool og save-integritet v1

Dette dokumentet er canonical kontrakt for hvordan en overtatt klubb får spillere.

## Hovedregel

Tre forskjellige relasjoner skal ikke blandes:

```text
player.clubAffiliations → hvilken klubb spilleren faktisk tilhører i managerpoolen
player.sourcePlaceIds   → hvilke History Go-steder som kan oppdage spilleren
club.homePlaceId        → hvilket stadion som åpner resten av klubbpoolen
```

`sourcePlaceIds` er derfor **ikke** bevis på klubbmedlemskap. Runtime skal aldri
utlede en Viking-, Brann- eller Rosenborg-pool ved å spørre hvilket sted som står
på spillerkortet.

## `clubAffiliations`

Spillerdata har en eksplisitt liste:

```json
{
  "clubAffiliations": [
    {
      "clubId": "viking",
      "relation": "played_for",
      "status": "club_profile",
      "source": "belagt"
    }
  ]
}
```

Tillatte relasjoner i v1:

- `played_for` — spilleren representerte klubben.
- `academy` — dokumentert akademi-/utviklingstilknytning.
- `origin_club` — eksplisitt opprinnelsesklubb der dette er relevant og dokumentert.
- `predecessor_club` — historisk forgjengerrelasjon som ikke skal forveksles med dagens klubb.

`status` bruker eksisterende klubbstatus-vokabular. `source` er `belagt` eller
`utledet`; migrering fra den gamle placeId-nøklede `clubStatus`-modellen beholder
denne kildegraden.

## Spillerpoolstatus

`data/football_clubs.json` bærer avledede felt:

```json
{
  "playerPoolSize": 70,
  "playerPoolStatus": "ready"
}
```

- `ready`: minst 15 eksplisitt tilknyttede spillere med dokumentert posisjon.
- `pending`: færre enn 15 slike spillbare profiler, uavhengig av hvor mange navn historikkatalogen inneholder.

En `pending` klubb skal ikke vises som nytt overtakelsesvalg. Spillet skal heller
mangle et valg midlertidig enn å fylle en virkelig klubb med tilfeldige ekte
spillere som aldri spilte der.

Poolen er uavhengig av History Go-stadion. Det er dermed mulig å gjøre en klubb
`ready` før riktig `homePlaceId` er på plass.

## Starttropp

For en `ready` klubb som ikke har full stadiontilgang:

1. Kandidatene avgrenses til klubbens egen `clubAffiliations`-pool.
2. **15 spillere er fortsatt minimumet** som gjør klubben takeover-klar.
3. Når klubbpoolen har nok spillbare profiler, bygges grunntroppen til **20 spillere** slik at slitasje, skader og rotasjon kan håndteres gjennom en hel sesong.
4. De første 15 dekker keeper, forsvar, midtbane og angrep etter den etablerte spillbarhetsfordelingen.
5. De fem ekstra plassene prioriterer konkrete posisjonsunderskudd for sesongrotasjon. Canonical mål er best mulig tilgjengelig dekning av 2 GK, 2 LB, 4 CB, 2 RB, 4 CM, 2 LW, 2 ST og 2 RW fra klubbens egen pool; motoren modellerer aldri nye posisjoner for å nå målet.
6. Ordinære tropps-/klubbprofiler prioriteres foran ikoner og legender.
7. Innenfor samme statusnivå prioriteres lavere `classHeight`.
8. Ingen global katalogfallback er tillatt for en overtatt klubb.

En klubb med bare 15 spillbare profiler er fortsatt `ready` og får alle sine 15. Troppsstørrelsen er dermed et sesongmessig dybdelag oppå det eksisterende spillbarhetsgulvet, ikke et nytt researchkrav.

Dette er et spillbarhetsgulv og en rotasjonsbuffer, ikke en påstand om en bestemt historisk førsteellever.

## Stadionbesøk

Hvis `homePlaceId` er besøkt i History Go, åpner manageren hele den eksplisitte
klubbpoolen. Dette skjer i tillegg til vanlige place-unlocks. Det er nødvendig
fordi en spiller kan tilhøre klubben uten å bruke stadionet som sitt eget
`sourcePlaceId`.

Hvis klubben har en `ready` pool men ennå ikke har `homePlaceId`, kan den teknisk
få sin klubbrene grunntropp, men resten av poolen kan ikke åpnes før stadionet er
koblet til History Go.

## Save-integritet

`teamMerits.localStart` lagrer for klubbgrunntropper:

```json
{
  "enabled": true,
  "source": "auto_squad",
  "clubId": "viking",
  "poolVersion": "historygo-football-manager.club-squad.v8",
  "generatedFrom": "club_pool",
  "playerIds": []
}
```

Ved lasting av en eldre overtakelsessave kontrolleres den lagrede auto-troppen
mot dagens canonical klubbpool før spiller-ID-ene gjøres tilgjengelige.

- Fremmede spiller-ID-er → troppen bygges på nytt fra riktig klubbpool.
- Gammel poolversjon → troppen bygges deterministisk på nytt.
- Stadionet er siden besøkt → auto-troppen fjernes, full klubbpool brukes.
- Klubben er `pending` → gammel auto-tropp fjernes; ingen global fallback.

Migreringen er idempotent: en allerede gyldig v8-save endres ikke igjen. v7-auto-tropper regenereres én gang slik at de får den nye posisjonsdekkende sesongbufferen.

## Datamigrering og audit

`scripts/sync-club-affiliations.mjs --write` materialiserer den første eksplisitte
klubbtilknytningen fra eksisterende `clubStatus`-data. Den bruker bevisst **ikke**
`sourcePlaceIds` som medlemskapskilde.

Uten `--write` er samme script en audit som feiler dersom:

- `clubAffiliations` har driftet fra canonical data;
- en ukjent klubb-ID eller relasjon finnes;
- `playerPoolSize` eller `playerPoolStatus` er feil;
- schema-/versjonsmarkører mangler;
- en gammel dokumentert `clubStatus`-relasjon mangler eksplisitt klubbtilknytning.

Full CI og Pages-deploy kjører denne auditen.

`sim:club-squad` vokter i tillegg runtime-reglene: ready-klubber får bare egne
spillere, pending-klubber får ingen global fallback, stadion åpner hele poolen,
og gamle saves repareres. For alle ready-klubber beviser simuleringen også at
auto-troppen oppnår best mulig canonical sesongdekning for hver posisjon gitt
det som faktisk finnes dokumentert i klubbpoolen.

## Dokumentert pool og spillbar pool

`listClubPoolPlayers` er klubbens komplette, dokumenterte historikkatalog. Den kan inneholde source-thin personer som foreløpig mangler dokumentert posisjon.

`listPlayableClubPoolPlayers` er den simuleringsklare delmengden. En profil må ha minst én dokumentert naturlig eller brukbar posisjon før den kan velges til tropp, oppstilling, trening eller kamp. Motoren modellerer aldri en posisjon for å få en klubb over 15-spillergrensen.

`playerPoolSize` teller dokumenterte klubbtilknytninger. `playablePlayerPoolSize` og `playerPoolStatus` følger den spillbare delmengden. Runtime rapporterer derfor `documentedCount`, `poolSize` og `unprofiledCount` separat.
