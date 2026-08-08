# Manager Club Organization v1

## Formål

Pass 5 gjør **Kontor → Klubben** til en utforskbar klubborganisasjon i stedet for et dashboard av ratings, fasilitetsnivåer og FM-lignende økonomisystemer.

Kalenderen eier fortsatt tiden. Klubben eier stedet, menneskene og de varige fagområdene rundt laget.

## Navigasjonskontrakt

Den dynamiske Speiding-flaten bruker allerede den gamle `Klubb`-knappen i hovednavigasjonen. Pass 5 oppretter derfor ingen ny hovedfane.

I normal ligasave ligger klubborganisasjonen under Kontor:

`Kalender · Klubben`

`board`-seksjonen blir en Kontor-underflate og presenteres som **Klubben**. De gamle dype underfanene `Klubbutvikling` og `Stab & drift` er ikke permanent synlige som en tab-vegg. De åpnes fra organisasjonen når manageren faktisk går inn i det aktuelle rommet.

## Organisasjonen

Hovedflaten er en katalog over mennesker og rom, ikke en samling statuskort.

### Fotballavdelingen

- **Trenerteam** – viser de stabsprofilene som faktisk er engasjert i klubbens save.
- **Treningsanlegg** – stedet for dokumenterte fysiske anleggsdata. Klubbdataene har foreløpig ikke treningsfelt, styrkerom, behandlingsrom eller utstyr; derfor vises ingen oppdiktede nivåer eller bonuser.
- **Medisinsk apparat** – bruker eksisterende spillercondition, belastning, skade og individuell oppfølging. Ingen separat medisinsk rating.
- **Analyse** – peker til det aktive systemet og eksisterende kampanalyse.

### Klubben

- **Styret** – forventning og aktuelt signal presenteres som kommunikasjon fra styret, ikke som permanent 0–100-dashboard.
- **Administrasjon** – tropp og støtteapparat. Fiktive lønninger, kontraktlengder, overgangssummer og kjøp/salg er ute av live IA.
- **Stadion og hjemmebane** – navn, by og History Go-kobling kommer fra `data/football_clubs.json`.
- **Klubbutvikling** – beholder den eksisterende History Go-kjeden `Sted → Person → Ekspertise → Utviklingsprogram → Badge → Lagklasse`.
- **Akademi** vises bare dersom canonical klubbdata faktisk dokumenterer et akademi. Pass 5 finner ikke på et.

## Alternativer og arbeid

Klubbrom åpnes i drawer/bottom sheet fra hovedflaten. Det holder hovedscenen ryddig samtidig som informasjonen er tilgjengelig.

Når et rom har en eksisterende arbeidsflate, gjenbrukes den:

- Trenerteam/Administrasjon → eksisterende `admin`-flate;
- Klubbutvikling → eksisterende `progression`-flate;
- Treningsanlegg/Medisinsk apparat → `Lag · Trening` der managerens faktiske treningsarbeid skjer;
- Analyse → `Systemet` og eksisterende kampanalyse.

Dype arbeidsflater får eksplisitt retur til Klubben. De blir ikke nye permanente underfaner.

## Rejected live IA

Pass 5 fjernet følgende fra normal klubbnavigasjon og hovedflate:

- fasilitetsnivå 1–3 og oppgraderingsknapper;
- fiktiv spillerøkonomi og lønnsenheter;
- fiktive flerårskontrakter på historiske spillere;
- overgangsvinduer, overgangsbud og kjøp/salg;
- kommersielt `Marked` som egen managerflate;
- permanent klubbpuls med rå 0–100-målere.

**Pass 7 er nå gjennomført:** økonomi-/kontrakt- og overgangsmotorene er permanent fjernet fra runtime, gamle `facilities`, `clubEconomy` og `transferMarket`-felter migreres ut av eksisterende saves, og fasilitetskompatibiliteten har null effekt og ingen UI. Se `MANAGER_LEGACY_CLEANUP_V1.md`.

## Datagrenser

Følgende kilder er autoritative:

- `data/football_clubs.json` for klubb, by, hjemmebane, nivå og History Go-sted;
- `data/football_staff.json` + `teamMerits.hiredStaffIds` for aktivt støtteapparat;
- eksisterende trening/condition for belastning, skade og oppfølging;
- eksisterende taktikk- og kampanalyse for Analyse-rommet;
- eksisterende History Go-progresjon for Klubbutvikling;
- Club Week og innboks for styre-/klubbsignaler.

`manager-club-organization-v1.js` er bare presentasjon og navigasjon. Den oppretter ingen ny klubbmotor, ingen ny progresjonsmotor og ingen ny localStorage-nøkkel.

## UI-regel

Klubborganisasjonen følger den permanente redesignregelen:

> Vis den faktiske organisasjonen først. Åpne et rom når manageren vil fordype seg. Ikke lag et dashboard når vi kan simulere en klubb.
