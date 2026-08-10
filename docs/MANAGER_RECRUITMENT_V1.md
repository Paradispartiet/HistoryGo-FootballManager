# Min spillerpool → Tropp v1

## Produktkontrakt

Spillermodellen er nå:

```text
History Go-samling → Min spillerpool → valgt klubbtropp → oppstilling / rolle / taktikk / trening / kamp
```

History Go avgjør hvem manageren har samlet. Klubben bruker bare spillerne manageren eksplisitt har valgt til troppen. Tropp-flaten viser derfor valgt tilstand først; alternativene åpnes med **Endre tropp**.

Dette er et utvalg fra en samling, ikke et overgangsmarked. V1 innfører ingen troppsgrense, byttefrist, overgangssum, lønn, kontrakt, agent eller skjult bonus.
Det finnes heller ingen ny progresjonsscore eller egen trenings-/kampeffekt.

## Canonical state

Valget bor i eksisterende `hgfm.teamMerits.v1`:

```json
{
  "playerPoolSquadVersion": 1,
  "squadPlayerIds": ["player_a", "player_b"]
}
```

`squadPlayerIds` er den eneste canonical listen over klubbens valgte tropp. Spillerpoolen lagres ikke som en parallell kopi; den utledes hver gang fra History Go-steder, quiz-porten, klubbtilgang og eventuell lokal starttropp.

Kjernen eksponerer to forskjellige mengder:

- `playerPoolIds` / `playerPoolPlayers`: alle spillere som kan velges;
- `unlockedPlayerIds` / `unlockedPlayers`: kompatibilitetsnavnet som oppstilling, trening og kamp allerede bruker, nå avgrenset til valgt tropp.

Dermed fortsetter eksisterende motorer å være fasit uten nye trenings-, kamp- eller condition-regler.

## Kontrollert save-migrering

`recruitedPlayerIds` beholdes som legacy-data, men eier ikke lenger troppsmedlemskap.

Når `playerPoolSquadVersion` mangler eller er `0`, kopierer migreringen nøyaktig spillerne den gamle runtime-modellen gjorde spillbare til `squadPlayerIds`. Deretter settes versjonen til `1`. Nye spillere som senere kommer inn i poolen blir ikke automatisk lagt i troppen.

Migreringen:

- mister ingen eksisterende troppsmedlemmer;
- kjører bare én gang;
- endrer ikke History Go-progresjon;
- oppretter ingen ny localStorage-nøkkel;
- lar øvrig save-state være urørt.

## UI

### Lag → Tropp

Hovedflaten viser bare den valgte troppen og den eksisterende spillerinformasjonen. **Endre tropp** åpner en side-drawer med hele Min spillerpool. Valgte spillere står først.

Manageren kan:

- søke på navn, posisjon eller kilde;
- vise hele poolen, bare troppen eller bare alternativer;
- velge en spiller inn;
- ta en spiller ut.

En spiller som står i startelleveren må først byttes ut på **Oppstilling**. Dette er en dataintegritetsregel, ikke en troppsgrense. Spilleren forsvinner aldri fra Min spillerpool når vedkommende tas ut.

### Speiding → Min spillerpool

Speiderflaten bruker samme språk og samme `squadPlayerIds`. Profilklikk endrer aldri troppen. Andre klubber er fortsatt kun en kunnskapsflate og påstår ikke å vise en live 2026-stall.

## Avgrensning

V1 har bevisst ingen:

- maksimums- eller minimumsstørrelse på den valgte troppen;
- karantene eller cooldown for troppsbytte;
- overgangsvindu;
- økonomi-, kontrakt- eller forhandlingsmodell;
- tilfeldig markedspool;
- ny progresjonsscore eller skjult kampeffekt.

Kampklarhetens eksisterende 11 + 4-krav består. Det er en forklaring på hva som trengs for kamp, ikke en regel som hindrer manageren i å redigere troppen.

## Permanente porter

CI verifiserer:

- ren state-normalisering, inn/ut-valg og pool-filtrering;
- engangsmigrering fra `recruitedPlayerIds` og gammel spillbar tropp;
- at nye poolfunn ikke automatisk blir troppsmedlemmer;
- samme-session oppdatering av Tropp, Oppstilling og Speiding;
- Endre tropp på desktop og 390 px;
- blokkering av uttak fra aktiv startellever;
- WCAG 2 A/AA uten alvorlige brudd;
- fravær av overgangsøkonomi og nye skjulte bonuser.
