# Manager Match Calendar v1

## Formål

Pass 4 gjør kampforberedelse og kampdag til arbeid som skjer **i managerkalenderen**, i stedet for å lage enda en separat flyt ved siden av Kalender.

**Kalenderen eier fredag og lørdag.** Fredagens hendelse åpner den eksisterende `Lag · Oppstilling`-flaten som kampforberedelse. Lørdagens hendelse åpner den eksisterende `Kamp`-flaten og den eksisterende kampdagsscenen.

Navigasjon mellom Kalender, Lag og Kamp flytter aldri tiden på egen hånd.

## Permanent kontrakt

- Kalender er fasit for uke, dag, klokkeslett og hendelse.
- Fredag er `match_prep` og presenteres som **Kampforberedelse** i `Lag · Oppstilling`.
- Lørdag er `matchday` og presenteres i den eksisterende **Kamp**-flaten.
- Club Week er fortsatt sannhetskilden for fase og progresjon.
- Ingen ny `Neste`-funksjon.
- Ingen ny progresjonsmotor.
- Ingen ny kalenderstate.
- Ingen ny localStorage-nøkkel.
- Ingen ny kampmotor.

## Fredag: kampforberedelse

Når manageren trykker `Kampforberedelse` i Kalender, sender Kalender eksplisitt arbeidskontekst før navigasjonen:

- uke;
- dag og dagnummer;
- klokkeslett;
- kalenderhendelsens id og tittel;
- eksisterende målflate (`tactics`).

`manager-match-calendar-v1.js` mottar denne konteksten i runtime-minne og viser én samlet fredagsoverflate over den eksisterende Lag-flaten.

Overflaten samler:

1. neste motstander;
2. autoritativ kampklarhet;
3. startellever og roller;
4. formasjon og kampplan;
5. benk og tilgjengelighet;
6. treningsprogram og treningsfokus;
7. motstanderens viktigste trussel.

Dette er bare presentasjon. Dataene leses fra de eksisterende lag-, trenings-, readiness- og kampbriefsystemene.

### Valg på fredag

Alternativer fjernes ikke. `Endre spiller eller rolle` og `Endre formasjon eller kampplan` bruker de eksisterende knappene og den felles Lag-valgdraweren. Dermed brukes samme spillerliste, samme roller, samme formasjoner, samme kampplaner, samme event handlers og samme state som ellers i Lag.

Den gamle `squadTacticsCommandPanel` demoteres visuelt når fredagens kampforberedelse er aktiv, men den faktiske oppstillingen, banen, benken og valgkildene beholdes.

Fredag har **ingen knapp som later som den flytter manageren til lørdag**. Kampdagen skjer når Club Week/Kalender faktisk står på kampdag.

## Lørdag: kampdag

Når manageren trykker lørdagens kamp i Kalender, sendes samme eksplisitte arbeidskontekst til `Kamp`.

Pass 4 legger bare en kalenderlinje over den eksisterende kampdagsscenen med:

- `Kalender · Uke X · Lørdag`;
- klokkeslett;
- den konkrete kamphendelsen;
- neste motstander;
- retur til samme lørdag i Kalender.

Selve kampdagen forblir den eksisterende femtilstands-scenen:

`blocked → ready → pre_match → live → report`

Pass 4 oppretter ingen av disse tilstandene og starter ikke kamp ved navigasjon.

## Retur til Kalender

Både fredag og lørdag har eksplisitt retur til kalenderdagen. Returen:

1. åpner Kontor/Kalender;
2. velger samme `dayIndex` som arbeidsflaten ble åpnet fra;
3. endrer ikke Club Week-fasen;
4. avanserer ikke uke eller kamp.

Hvis Lag eller Kamp åpnes direkte mens Club Week allerede står i henholdsvis `match_prep` eller `matchday`, brukes den eksisterende Club Week-staten som presentasjonsfallback. Det opprettes fortsatt ingen separat tidsstate.

## Motorgrenser

Følgende systemer er fortsatt sannhetskilder:

- `football-matchday-readiness.js` eier kampklarhet og blokkeringer;
- `football-matchday-engine.js` eier kampsesjon, avspark, klokke, hendelser, managergrep, bytter og sluttresultat;
- `football-match-plan.js` eier kampplan og kampbildet;
- eksisterende lag-/rolle-/fitmotorer eier oppstilling og rollebruk;
- `football-player-condition.js` eier tilgjengelighet, slitasje og skader;
- treningsmotorene eier treningsprogram og fokus;
- `football-league-season.js` eier terminliste og motstander;
- Club Week eier fase og progresjon;
- `football-manager-calendar.js` organiserer disse til dagene i uka;
- `manager-match-calendar-v1.js` eier bare kalenderbundet presentasjon og retur.

## Regresjonsvern

Permanent audit og simulering låser kontrakten. Playwright skal bevise:

- fredag i Kalender → eksisterende Lag-flate → kampforberedelse;
- komplette eksisterende Lag-valg i drawer;
- retur til samme fredag;
- lørdag i Kalender → eksisterende Kamp-scene;
- retur til samme lørdag;
- ingen mobil overflow;
- ingen alvorlige WCAG A/AA-brudd i de nye kalenderflatene.
