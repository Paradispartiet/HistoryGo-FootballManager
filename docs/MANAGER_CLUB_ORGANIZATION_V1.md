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
- **Medisinsk apparat** – bruker eksisterende spillercondition, belastning, skade og individuell oppfølging. Når save-staten har et reelt signal, åpner rommet et beslutningsverksted for kriteriebasert opptrening og retur til spill. Ingen separat medisinsk rating.
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
- Treningsanlegg → `Lag · Trening` der managerens faktiske treningsarbeid skjer;
- Medisinsk apparat → beslutningsverkstedet i rommet og eksisterende **Individuell oppfølging** under `Lag · Trening`;
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

## Medisinsk beslutningsverksted

`Kontor → Klubben → Medisinsk apparat` lar manageren arbeide med et faktisk condition-signal gjennom:

```text
aktiv modussnapshot
→ hva vet vi / hva mangler vi
→ velg neste medisinske arbeidssteg
→ faglig konsekvens og forklaring
→ eksisterende individuell opptrening
```

Den skadde spilleren med lengst registrert fravær prioriteres. Hvis ingen er skadet, brukes spilleren med høyest belastning over condition-motorens tretthetsgrense. Når aktiv save-/modussnapshot ikke har et slikt signal, opprettes ingen oppdiktet pasient.

Verkstedet lærer forskjellen mellom full retur nå, retur styrt av ukeestimat alene og kriteriebasert opptrening med ny funksjonsvurdering. Retur til fotball må vurderes mot symptomer, funksjon, styrke/bevegelighet, løp og sprint, spillerens trygghet og en delt beslutning mellom relevante fagpersoner, trener og spiller. Det finnes ikke ett validert enkeltkriterium som alene avgjør trygg retur.

`football-medical-decision-learning.js` er et rent læringslag. Det diagnostiserer ingen skade og endrer aldri skade, belastning, form, tilgjengelighet eller kampklarhet. UI-et leser `playerCondition` fra den aktive `hgfm.modeSessions.v1`-sesjonen og bruker `hgfm.playerCondition.v1` bare som migreringsfallback. Det skriver ingen state, oppretter ingen ny lagringsnøkkel, score eller skjult effekt, og sender anbefalt oppfølging til den eksisterende **Individuell oppfølging**-flaten.

Faggrunnlaget er:

- [London International Consensus and Delphi study on hamstring injuries, part 3](https://bjsm.bmj.com/content/57/5/278) — individuell rehabilitering, progresjon etter symptomer/kapasitet, smertefri sprint og kampkrav som sluttmål;
- [Return to play criteria after hamstring muscle injury in professional football](https://bjsm.bmj.com/content/51/16/1221) — funksjon, styrke, bevegelighet, smerte og spillerens trygghet;
- [Return to play after hamstring injuries in football: a worldwide Delphi procedure](https://pubmed.ncbi.nlm.nih.gov/28360143/) — smertefri undersøkelse/funksjon, feltprøver, medisinsk klarering og delt beslutning.

Kildene brukes til generelle læringsprinsipper. Verkstedet gir ikke medisinske råd til virkelige personer.

## UI-regel

Klubborganisasjonen følger den permanente redesignregelen:

> Vis den faktiske organisasjonen først. Åpne et rom når manageren vil fordype seg. Ikke lag et dashboard når vi kan simulere en klubb.
